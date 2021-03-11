/**
 * sets up default values for each board
 */
class Board {
    description;
    id;
    name;
    tasks = [];
    taskNumbers = {};

    constructor(id, name, desc) {
        this.description = desc || "";
        this.id = id + "";
        this.name = name;
    }
}

/**
 * sets up default values for tasks
 */
class Task {
    id;
    boardId;
    taskName;
    archived = false;
    dateCreated;

    constructor(id, boardId, taskName, archived) {
        this.id = id + "";
        this.boardId = boardId + "";
        this.taskName = taskName + "";
        this.archived = archived === true;
        this.dateCreated = Date.now();
    }
}

/**
 * array to hold board objects
 * seeded with beginning data
 * @type [{description: string, id: string, name: string, tasks: Array, taskNumbers: {object} }]
 *
 */
var boards = [];

/**
 * object holding pairs of board id and it's index in the boards array
 *  { idNumber: indexNumber, ...}
 * @type  {{{string}: number, ..}}
 */
var boardNumbers = {};

/**
 * counter for board id's
 * increment but never decrease, so id's won't get reused
 * @type {number}
 */
var boardCounter = 0;

/**
 * counter for task id's
 * increment but never decrease, so id's won't get reused
 * @type {number}
 */
var taskCounter = 0;

/**
 * initialize boards with data, if it is empty
 */
function preSeedBoards(){
    if (boards.length > 0){
        return;
    }
    console.log("Initializing boards ...");
    boards = [
        {
            id: '0',
            name: "Planned",
            description: "Everything that's on the todo list.",
            taskNumbers: {'0': 0, '1': 1, '2': 2},
            tasks: [
                {
                    id: '0',
                    boardId: '0',
                    taskName: "Another task",
                    dateCreated: Date.UTC(2021, 0, 21, 15, 48),
                    archived: false
                },
                {
                    id: '1',
                    boardId: '0',
                    taskName: "Prepare exam draft",
                    dateCreated: Date.UTC(2021, 0, 21, 16, 48),
                    archived: false
                },
                {
                    id: '2',
                    boardId: '0',
                    taskName: "Discuss exam organisation",
                    dateCreated: Date.UTC(2021, 0, 21, 14, 48),
                    archived: false
                }
            ]
        },
        {id: '1', name: "Ongoing", description: "Currently in progress.", taskNumbers: {}, tasks: []},
        {
            id: '3', name: "Done", description: "Completed tasks.", taskNumbers: {'3': 0}, tasks: [
                {
                    id: '3',
                    boardId: '3',
                    taskName: "Prepare assignment 2",
                    dateCreated: Date.UTC(2021, 0, 10, 16, 0),
                    archived: true
                }
            ]
        }
    ];
    boardNumbers = {'0': 0, '1': 1, '3': 2};
    boardCounter = 4;
    taskCounter = 4;
}

/**
 * Returns a single board given a boardId
 * @param boardId {string} id of board
 * @returns {{name: string, description: string, id: string, tasks: []}|boolean} all
 *      properties except the taskNumbers index object
 */
function getBoard(boardId) {
    //previously verified if board exists
    boardId += "";
    let boardIdx = boardNumbers[boardId];
    let board = boards[boardIdx];
    let taskNums = {};
    //do a shallow copy, we know there are no nested values
    Object.assign(taskNums, board.taskNumbers);
    let obj = {id: board.id, name: board.name, description: board.description, tasks: [], taskNumbers: taskNums};
    let temp = obj.tasks;
    for (var i = 0; i < board.tasks.length; i++) {
        let task = board.tasks[i];
        temp.push({
            id: task.id,
            boardId: task.boardId,
            taskName: task.taskName,
            archived: task.archived,
            dateCreated: task.dateCreated
        })
    }
    return obj;
}

/**
 * Gets a specific task given board id and task id
 * @param boardId {string} id of board
 * @param taskId {string} id of task
 * @returns {{archived: boolean, dateCreated: number, boardId: string, taskName: string, id: string}}
 * returns all task properties
 */
function getTask(boardId, taskId) {
    //already run taskExists before this function, so just get it

    let boardIdx = boardNumbers[boardId + ""];
    let board = boards[boardIdx];
    let taskIdx = board.taskNumbers[taskId + ""]
    let task = board.tasks[taskIdx];
    return {
        id: task.id,
        boardId: task.boardId,
        taskName: task.taskName,
        archived: task.archived,
        dateCreated: task.dateCreated
    };
}

/**
 * Gets all boards in the back end
 * @returns {{id: string, name: string, description: string}[]}
 * returns array of board objects without
 * the tasks array or empty array if zero boards
 */
function getAllBoards() {
    let temp = []; //Remember not to make copies in nodejs, you must make temp or you will edit the deep copy.
    for (var i = 0; i < boards.length; i++) {
        let board = boards[i];
        //only wants short property object, tasks left out
        temp.push({id: board.id, name: board.name, description: board.description})
    }
    return temp;
}

/**
 * delete all boards
 * @returns {{description: string, id: string, name: string, tasks: Array}[]}
 * returns all boards with tasks
 */
function deleteAllBoards(){
    let result = boards.splice(0);
    boards = [];
    boardNumbers = {};
    return result;
}

/**
 * Completely update board besides id and tasks, only if all tasks archived
 * @param boardId {string} board id
 * @param params {{name: string, description: string}}
 * @returns {{name: string, description: string, id: string, tasks: *[]}|boolean}
 * returns updated board or false
 */
function updateBoard(boardId, params){
    let mustHave = ["name", "description"];
    let submitted = Object.keys(params);
    let opt, idx, errorArr = [], prop, allowed = [];
    let board = boards[boardNumbers[boardId +""]];
    let tasks = board.tasks;
    //loop through tasks looking for a false archived property
    for (var k = 0; k < tasks.length; k++) {
        if (!tasks[k].archived) {
            console.log("error updating board, non-archived tasks", tasks[k])
            return false;
        }
    }
    console.log("Updating board, properties: ", params);
    for (var i = 0; i < submitted.length; i++) {
        prop = submitted[i];
        idx = mustHave.indexOf(prop);
        if(idx !== -1) {
            //parameter checks
            if (params[prop] !== undefined && params[prop] !== "" && typeof params[prop] !== "object" && typeof params[prop] !== "function") {
                allowed.push(prop);
                //remove match from possible
                mustHave.splice(idx, 1);
            } else {
                //bad property
                errorArr.push(prop);
            }
        } else {
            //not allowed property
            errorArr.push(prop);
        }
    }
    //any errors?
    if (errorArr.length > 0) {
        console.log("Error updating board, bad parameters: ", errorArr);
        return false;
    }
    //did we find any matching possible update properties
    //should have removed all in mustHave
    if (mustHave.length > 0) {
        console.log("Error patching task, missing parameters: ", mustHave);
        return false;
    }
    //copy props over
    for (var j = 0; j < allowed.length; j++) {
        opt = allowed[j] + "";
        //make sure we are using strings
        params[opt] += "";
        params[opt] = params[opt].length > 120 ? params[opt].slice(0,120) + "..." : params[opt];
        board[opt] = params[opt];
    }
    //console.log("Updated board: ", board);
    return {
        id: board.id,
        name: board.name,
        description: board.description,
        tasks: board.tasks.slice(0),
        taskNumbers: Object.assign({}, board.taskNumbers)
    };
}

/**
 * get all tasks for a specific board
 * @param boardId {string} board id
 * @param {string} [prop] sort property optional
 * @returns {boolean|{id: string, boardId: string, taskName: string, archived: boolean, dateCreated: number}[]}
 * returns an array of task objects, optionally sorted by id, dateCreated, or taskName.
 * returns false if board does not exist
 */
function getTasksForBoard(boardId, prop) {
    if (boardExists(boardId)) {
        let sortProp = "";
        if(prop !== undefined && prop !== ""){
            let allowed = ["id", "dateCreated", "taskName"];
            if (allowed.indexOf(prop) !== -1){
                sortProp = prop;
            }
        }
        //make sure it is a string
        boardId += "";
        let boardIdx = boardNumbers[boardId];
        let board = boards[boardIdx];
        let temp = [];
        for (var i = 0; i < board.tasks.length; i++) {
            let task = board.tasks[i];
            temp.push({
                id: task.id,
                boardId: task.boardId,
                taskName: task.taskName,
                archived: task.archived,
                dateCreated: task.dateCreated
            });
        }
        if (sortProp !== ""){
            if(sortProp === "taskName"){
                temp.sort(function(a, b){
                    var x = a[sortProp].toLowerCase();
                    var y = b[sortProp].toLowerCase();
                    if (x < y) {return -1;}
                    if (x > y) {return 1;}
                    return 0;
                });
            } else {
                temp.sort(function(a, b){
                    return a[sortProp] - b[sortProp];
                });
            }
        }
        return temp;
    } else {
        //board does not exist or bad boardId
        return false;
    }
}

/**
 * creates new board from class and adds to boardNumbers index
 * @param name {string} name of board
 * @param desc {string} description of board
 * @returns {{name: string, description: string, id: string}|boolean}
 * returns created board or false if name is not a valid string
 */
function newBoard(name, desc) {
    if (name !== undefined && name !== "" && typeof name !== "object") {
        name = name + "";
        name = name.length > 120 ? name.slice(0, 120) + "..." : name;
        let boardId = boardCounter;
        boardCounter++;
        //check id by cycle through boardIds to find an unused number
        while (boardNumbers[boardId + ""] !== undefined) {
            boardId++;
            boardCounter++;
        }
        if (desc === undefined || desc === "" || typeof name === "object"){
            desc = "";
        }
        desc = desc + "";
        desc = desc.length > 120 ? desc.slice(0,120) + "..." : desc;
        let board = new Board(boardId + "", name, desc);
        boardNumbers[boardId + ""] = boards.length;
        boards.push(board);
        return {id: board.id, name: board.name, description: board.description, tasks: [], taskNumbers: {}};
    } else {
        //bad name
        return false;
    }
}

/**
 * create task for specific board
 * @param boardId {string} id of board
 * @param name {string} name for taskName
 * @returns {boolean|{archived: boolean, dateCreated: number, boardId: string, taskName: string, id: string}}
 * returns false for bad name o
 */
function createTask(boardId, name) {
    //previously verified board exists
    if (name !== undefined && name !== "" && typeof name !== "object") {
        name = name + "";
        name = name.length > 120 ? name.slice(0, 120) + "..." : name;
        let taskId = taskCounter;
        taskCounter++;
        let boardIdx = boardNumbers[boardId + ""];
        let board = boards[boardIdx];
        let tasks = board.tasks;
        let task = new Task(taskId, boardId, name + "", false);
        board.taskNumbers[task.id] = tasks.length;
        tasks.push(task);
        return {
            id: task.id,
            boardId: task.boardId,
            taskName: task.taskName,
            dateCreated: task.dateCreated,
            archived: task.archived
        };
    }
    //bad name
    return false;
}

/**
 * partially update a specific task
 * @param boardId {string} board id
 * @param taskId {string} task id
 * @param params {{boardId: string}|{taskName: string}|{archived: boolean}} property to change
 *
 * @returns {boolean|{archived: boolean, dateCreated: number, boardId: string, taskName: string, id: string}}
 * returns false if there are not the correct parameters or not allowed parameters
 */
function updateTask(boardId, taskId, params) {
    //previously verify undefined, empty strings or no params
    let possible = ["boardId", "taskName", "archived"];
    let possLength = possible.length;
    let submitted = Object.keys(params);
    let idx, paramBoardId, prop, allowed = [], moving = false;
    let opt, errorArr = [];
    let boardIdx = boardNumbers[boardId + ""];
    let taskIdx = boards[boardIdx].taskNumbers[taskId + ""];
    let task = boards[boardIdx].tasks[taskIdx];
    for (var i = 0; i < submitted.length; i++) {
        prop = submitted[i];
        idx = possible.indexOf(prop);
        if (idx !== -1) {
            //parameter checks
            if (params[prop] !== undefined && params[prop] !== "" && typeof params[prop] !== "object" && typeof params[prop] !== "function") {
                //check for special case of moving
                if (prop === "boardId") {
                    paramBoardId = params[prop] + "";
                    //are we moving
                    if (paramBoardId !== boardId + "") {
                        //does new board exist?
                        if (!boardExists(paramBoardId)) {
                            errorArr.push(prop);
                        } else {
                            //all good continue
                            moving = true;
                            allowed.push(prop);
                            //remove match from possible
                            possible.splice(idx, 1);
                        }
                    }
                } else {
                    //all other props
                    allowed.push(prop);
                    //remove match from possible
                    possible.splice(idx, 1);
                }
            } else {
                //bad property
                errorArr.push(prop);
            }
        } else {
            //not allowed property
            errorArr.push(prop);
        }
    }
    //any errors?
    if (errorArr.length > 0) {
        console.log("Error patching task, bad parameters: ", errorArr);
        return false;
    }
    //did we find any matching possible update properties
    if (possible.length === possLength) {
        console.log("Error patching task, no matching parameters for: ", possible);
        return false;
    }
    //console.log("old task: ", task);
    //copy props over
    for (var j = 0; j < allowed.length; j++) {
        opt = allowed[j];
        //make sure we are using strings
        task[opt] = opt === "archived" ? params[opt] : params[opt] + "";
    }
    //console.log("new task: ", task);
    let obj = {
        id: task.id,
        boardId: task.boardId,
        taskName: task.taskName,
        dateCreated: task.dateCreated,
        archived: task.archived
    };
    if (moving) {
        //moved the task we have housekeeping to do
        //remove from old board and get it returned in an array of 1
        let newTaskArray = boards[boardIdx].tasks.splice(taskIdx, 1);
        //delete task from old boards taskNumbers
        delete boards[boardIdx].taskNumbers[taskId];
        //update old board taskNumbers index for other tasks starting at taskIdx
        let tasks = boards[boardIdx].tasks;
        for (var k = taskIdx; k < tasks.length; k++) {
            boards[boardIdx].taskNumbers[tasks[k].id] = k;
        }
        let newBoard = boards[boardNumbers[paramBoardId]];
        //add to new board task index and push the task
        newBoard.taskNumbers[taskId] = newBoard.tasks.length;
        newBoard.tasks.push(newTaskArray[0]);
    }
    return obj;
}

/**
 * delete specific task from board
 * @param boardId {string} board id
 * @param taskId {string} task id
 *
 * @returns {{id: string, taskName: string, boardId: string, archived: string, dateCreated: number}[]}
 * returns deleted task
 */
function deleteTask(boardId, taskId) {
    //previously verify undefined, empty strings
    let boardIdx = boardNumbers[boardId + ""];
    let taskIdx = boards[boardIdx].taskNumbers[taskId + ""];
    //remove from old board and get it returned in an array of 1
    let delTaskArray = boards[boardIdx].tasks.splice(taskIdx, 1);
    //delete task from taskNumbers
    delete boards[boardIdx].taskNumbers[taskId];
    //update index for other tasks starting at taskIdx
    let tasks = boards[boardIdx].tasks;
    for (var k = taskIdx; k < tasks.length; k++) {
        boards[boardIdx].taskNumbers[tasks[k].id] = k;
    }
    return delTaskArray[0];
}

/**
 * delete specific board
 * @param boardId {string} board id
 * @returns {{name: string, description: string, id: string, tasks: []}|boolean}
 * returns deleted board ot false for error
 */
function deleteBoard(boardId) {
    //previously verified board exists
    let boardIdx = boardNumbers[boardId];
    let board = boards[boardIdx];
    let tasks = board.tasks;
    //loop through tasks looking for a false archived property
    for (var i = 0; i < tasks.length; i++) {
        if (!tasks[i].archived) {
            return false;
        }
    }
    // all are archived or no tasks
    let result = {id: board.id, description: board.description, name: board.name, tasks: [], taskNumbers: Object.assign({}, board.taskNumbers)};
    result.tasks = tasks.splice(0);
    //housekeeping
    delete boardNumbers[boardId];
    boards.splice(boardIdx, 1);
    //update boardNumbers index
    for (var j = boardIdx; j < boards.length; j++) {
        boardNumbers[boards[j].id] = j;
    }
    return result;
}

/**
 * verify if board exists
 * @param boardId {string} id of board
 * @param taskId {string} id of task
 * @returns {boolean} whether task exists
 */
function taskExists(boardId, taskId) {
    //previously verified undefined and empty string
    if (typeof taskId !== "object" && typeof taskId !== "function" && typeof boardId !== "object" && typeof boardId !== "function") {
        if(boardId.length > 4 || taskId.length > 4){
            console.log("boardId or taskId length error");
            return false;
        }
        if (boardNumbers[boardId + ""] !== undefined) {
            let boardIdx = boardNumbers[boardId + ""]
            let board = boards[boardIdx];
            return board.taskNumbers[taskId + ""] !== undefined;
        }
    }
    return false;
}

/**
 * checks if board exits
 * @param boardId {string} board id
 * @returns {boolean} whether board exists
 */
function boardExists(boardId) {
    //previously verified undefined and empty string
    if (typeof boardId !== "object" && typeof boardId !== "function" ) {
        if(boardId.length > 4){
            console.log("boardId length error");
            return false;
        }
        return boardNumbers[boardId + ""] !== undefined;
    }
    return false;
}

//In node js all methods are private and can NOT be used by other files until they are exported
//This is the flip side of require()
module.exports.preSeedBoards = preSeedBoards;
module.exports.boardExists = boardExists;
module.exports.taskExists = taskExists;
module.exports.getAllBoards = getAllBoards;
module.exports.getTasksForBoard = getTasksForBoard;
module.exports.getBoard = getBoard;
module.exports.getTask = getTask;
module.exports.newBoard = newBoard;
module.exports.createTask = createTask;
module.exports.updateTask = updateTask;
module.exports.updateBoard = updateBoard;
module.exports.deleteTask = deleteTask;
module.exports.deleteBoard = deleteBoard;
module.exports.deleteAllBoards = deleteAllBoards;