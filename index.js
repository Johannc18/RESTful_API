const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

//require() is nodejs' import (python), Note: the name must be all lower case i.e. ./boardmgr
const boardMgr = require('./boardmgr');

//seed boards
boardMgr.preSeedBoards();

//Port environment variable already set up to run on Heroku
var port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());

// get an array of all boards
// can also repopulate an empty boards array with the initial set
// just add "?preSeed=true" to the get all boards url
// useful after testing delete all boards -- don't have to restart server
app.get('/api/v1/boards', function (req, res) {
    //sort result
    if(req.query && req.query.preSeed !== undefined && req.query.preSeed !== "" &&  req.query.preSeed === "true"){
        console.log(" query: ", req.query);
        //seed boards
        boardMgr.preSeedBoards();
    }
    let result = boardMgr.getAllBoards();
    console.log("get boards response: ", result);
    res.status(200).send(result).json; //response code:200 is html status code for verified or "Yes!" from project description
})

// create a new board
app.post('/api/v1/boards', function (req,res){
    let name = req.body.name;
    let desc = req.body.description;
    if(name === undefined || name === "" || typeof name === "object"){
        console.log("error adding board name: " + req.body.name);
        res.status(400).send("error adding board name: " + req.body.name);
    } else {
        let board = boardMgr.newBoard(name, desc);
        if (!board){
            console.log("error adding board name: " + req.body.name);
            res.status(400).send("error adding board name: " + req.body.name);
        } else {
            console.log("added board: ", board);
            res.status(201).send(board).json;
        }
    }
})

//delete all boards
app.delete('/api/v1/boards', function (req, res){
    // console.log("Delete all boards ", req.body);
    // if(!req.body || req.body.boardId !== "ClearBoards"){
    //     res.status(400).send("need boardId");
    // } else {
        let result = boardMgr.deleteAllBoards();
        console.log("Deleted all boards: ", result);
        res.status(200).send(result).json;
    // }
})

//get a specific board
app.get('/api/v1/boards/:boardId', function (req, res) {
    let boardId = req.params.boardId + "";
    if (boardId !== undefined && boardId !== "" && typeof boardId !== "object") {
        if (boardMgr.boardExists(boardId)) {
            let result = boardMgr.getBoard(boardId);
            console.log("get board response: ", result);
            res.status(200).send(result).json;
        } else {
            //board does not exist
            console.log("error getting board: " + boardId + ", does not exist");
            res.status(404).send("error getting board: " + boardId + ", does not exist");
        }
    } else {
        //bad board id
        console.log("error getting board: " + boardId);
        res.status(400).send("error getting board: " + boardId);
    }
})

//update a specific board
app.put('/api/v1/boards/:boardId', function (req, res) {
    let boardId = req.params.boardId + "";
    if (boardId !== undefined && boardId !== "" && typeof boardId !== "object" && req.body && Object.keys(req.body).length > 0 ) {
        if (boardMgr.boardExists(boardId)) {
            let result = boardMgr.updateBoard(boardId, req.body);
            if(result) {
                console.log("Success updating board: ", result);
                res.status(201).send(result).json;
            } else {
                //bad board properties
                console.log("error updating board: " + boardId + ": ", req.body);
                res.status(400).send("error updating board: " + boardId + ": " + JSON.stringify(req.body));
            }
        } else {
            //board does not exist
            console.log("error updating board: " + boardId + ", does not exist");
            res.status(404).send("error updating board: " + boardId);
        }
    } else {
        //bad board id
        console.log("error updating board: " + boardId);
        res.status(400).send("error updating board: " + boardId);
    }
})

//delete a specific board
app.delete('/api/v1/boards/:boardId', function (req, res) {
    let boardId = req.params.boardId + "";
    if (boardId !== undefined && boardId !== "" && typeof boardId !== "object"){
        if(boardMgr.boardExists(boardId)){
            let result = boardMgr.deleteBoard(boardId);
            if(result){
                console.log("deleted board: ", result);
                res.status(200).send(result).json;
            } else {
                //non-archived task
                console.log("error deleting board: " + boardId + ", has tasks that are not archived");
                res.status(400).send("error deleting board: " + boardId);
            }
        } else {
            //board does not exist
            console.log("error deleting board: " + boardId + ", does not exist");
            res.status(404).send("error deleting board: " + boardId);
        }
    } else {
        //bad board id
        console.log("error deleting board: " + boardId);
        res.status(400).send("error deleting board: " + boardId);
    }
})

// get all tasks for a specific board
app.get('/api/v1/boards/:boardId/tasks', function (req, res) {
    if(req.params.boardId !== undefined && req.params.boardId !== "" && typeof req.params.boardId !== "object") {
        let prop, boardId = req.params.boardId + "";
        //sort result
        if(req.query && req.query.sort !== undefined && req.query.sort !== "" && typeof req.query.sort !== "object"){
            console.log(" query: ", req.query);
            prop = req.query.sort;
        }
        let result = boardMgr.getTasksForBoard(boardId, prop);
        if (!result) {
            console.log("error getting tasks for board: " + boardId);
            res.status(404).send("error getting tasks for board: " + boardId + (!!prop ? " query " + req.query : ""));
        } else {
            console.log("get tasks for board: " + boardId + " ", result);
            res.status(200).send(result).json;
        }
    } else {
        console.log("error getting tasks for board: " + req.params.boardId);
        res.status(400).send("error getting tasks for board: " + req.params.boardId);
    }
})

// create new task for a specific board
app.post('/api/v1/boards/:boardId/tasks', function (req, res){
    let boardId = req.params.boardId;
    let name = req.body.taskName;
    if (boardId === undefined || boardId === "" || name === undefined || name === "" || typeof name === "object"){
        console.log("Error creating taskName: " + name + ", for board: " + boardId);
        res.status(400).send("Error creating task " + req.params);
    } else if(boardMgr.boardExists(boardId)){
        let task = boardMgr.createTask(boardId, name);
        if(!task){
            console.log("Error creating taskName: " + name + ", for board: " + boardId);
            res.status(400).send("Error creating task " + req.params);
        } else {
            console.log("Created taskName: " + name + ", for board: " + boardId);
            res.status(201).send(task).json;
        }
    } else {
        console.log("Error creating task board:" + boardId + ", board does not exist");
        res.status(404).send({error: "Error creating task board:" + boardId + ", board does not exist"});
    }
})

//get a specific task
app.get('/api/v1/boards/:boardId/tasks/:taskId', function (req, res){
    let boardId = req.params.boardId;
    let taskId = req.params.taskId;
    if (boardId === undefined || boardId === "" || typeof boardId === "object" || taskId === undefined || taskId === "" || typeof taskId === "object"){
        console.log("Error getting task: " + taskId + ", for board: " + boardId);
        res.status(400).send("Error getting task " + req.params);
    } else if(boardMgr.taskExists(boardId, taskId)){
        let task = boardMgr.getTask(boardId, taskId);
        if(!task){
            console.log("Error getting taskName: " + taskId + ", for board: " + boardId);
            res.status(400).send("Error getting task " + req.params);
        } else {
            console.log("get taskName: " + taskId + ", for board: " + boardId);
            res.status(201).send(task).json;
        }
    } else {
        console.log("Error getting task board:" + boardId + ", task:" + taskId +" does not exist");
        res.status(404).send({error: "Error getting task, does not exist"});
    }
})

//update a specific task
app.patch('/api/v1/boards/:boardId/tasks/:taskId', function (req, res){
    let boardId = req.params.boardId;
    let taskId = req.params.taskId;
    if (boardId === undefined || boardId === "" || taskId === undefined || taskId === "" || !req.body || Object.keys(req.body).length === 0 ){
        console.log("Error patching task: " + taskId + ", for board: " + boardId);
        res.status(400).send("Error patching task " + req.params);
    } else if(boardMgr.taskExists(boardId, taskId)){
        console.log("patching board:" + boardId + ", task:"+ taskId + ", options: ", req.body);
        let task = boardMgr.updateTask(boardId, taskId, req.body);
        if (task === false){
            console.log("Error patching task: " + taskId + ", for board: " + boardId);
            res.status(400).send("Error patching task " + req.params);
        } else {
            console.log("Success patching task: ", task);
            res.status(200).send(task).json;
        }
    } else {
        console.log("Error patching task board:" + boardId + ", task:" + taskId +" does not exist");
        res.status(404).send("Error patching task, does not exist");
    }

})

//delete a specific task
app.delete('/api/v1/boards/:boardId/tasks/:taskId', function (req, res) {
    let boardId = req.params.boardId;
    let taskId = req.params.taskId;
    if (boardId === undefined || boardId === "" || taskId === undefined || taskId === "" || Object.keys(req.body).length > 0 ){
        console.log("Error deleting task: " + taskId + ", for board: " + boardId);
        res.status(400).send("Error deleting task " + req.params);
    } else if(boardMgr.taskExists(boardId, taskId)){
        console.log("deleting board:" + boardId + ", task:"+ taskId);
        let delTask = boardMgr.deleteTask(boardId, taskId);
        if(delTask){
            console.log("Success deleting task: ", delTask);
            res.status(200).send(delTask).json;
        } else {
            console.log("Error deleting task: " + taskId + ", for board: " + boardId);
            res.status(400).send("Error deleting task " + req.params);
        }
    } else {
        console.log("Error deleting task board:" + boardId + ", task:" + taskId +" does not exist");
        res.status(404).send({error: "Error deleting task, does not exist"});
    }
})

//catch all not given specific methods and paths
app.use((req, res) =>{
    console.log("Error 405 requested url: " + req.url + ", method: " + req.method);
    res.sendStatus(405);
})

//Start the server
app.listen(port, () => {
    console.log('Event app listening on port: ', port);
});
