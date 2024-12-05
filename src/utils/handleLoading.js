import {priorityQueue} from './priority.js'
import {Problem, Node, processData, hashGrid} from './problem.js'

// logic for handling the A* search algo smth
// logic for loading is similar to balancing, can use same heuristic, but without the balance constraint, general search is slightly tweaked as well
/*
Goal test: we have two options, goal state where we measure time or goal state we know we reached if it we completed all the operations
so i believe this goal test will need to be when we run out of operations, then we know we are done, we queue the operations based on costs gn and hn
*/
class LoadNode extends Node{
    constructor(problem, parent, move, cost, ops){
        super(problem, parent, move, cost);
        this.ops = ops;
    }

    getOps(){
        return this.ops;
    }
}

function goalTest(ops, operations) {
    return ops.length === operations.length;
}

//what are some possible moves
//so we can move every container in the ship plus the containers in the trucks
//assume all trucks are pulled up
//lets assume every operation is this, if we find a valid container to move, we can check if it is in our list of operations, if it is in our list of operations 
//and in the ship grid, we know that this is an unload 
//we also know in our available moves are all the load operations that have not been done yet
function isOperation(op, operations){
    for(let i = 0; i < operations.length; i++){
        if(op.name === operations[i].name){
            return [operations[i], true];
        }
    }
    return [null, false];
}

function isBottomE(ship, i, j){
    if(i == 0 && ship[i][j].name === "UNUSED") {
        return true
    }
    return false;
}

function eUnderneath(ship, i, j){
    if(isBottomE(ship, i, j) || ship[i-1][j].name != "UNUSED"){
        return true;
    }
    return false;
}

function findOpenCells(ship){
    let openCells = [];
    
    for(let i = 0; i < ship.length; i++) {
        for(let j = 0; j < ship[i].length;j++) {
            if(ship[i][j].name == "UNUSED" && eUnderneath(ship, i, j)){
                openCells.push([i, j]);
            }
        }
    }
    return openCells;
}

function addMoves(parent, moves, ship, i, j, operations){
    let check = isOperation(ship[i][j], operations); 
    let isOp = check[1];

    if(isOp){
        // console.log(type);
        let op = check[0];
        let type = op.type;
        if(type == "offload"){
            ship[i][j] = "UNUSED";
            let problem = new Problem(ship);
            let newOps = parent.ops;
            let dist = Math.abs(9-i) + Math.abs(0 - (j + 1)) + 2;
            newOps.push(check[0]);
            moves.push({
                move: {
                    type: "offload",
                    name: ship[i][j].name,
                    time: dist,
                    oldRow: i,
                    oldCol: j,
                    newRow: -1,
                    newCol: -1,
                },
                problem: problem,
                parent: parent,
                ops: newOps,
                cost: dist,
            })
        }
    }
    return;
}

function addOperations(parent, moves, ship, ops, operations) {
    for (let i = 0; i < operations.length; i++){
        if(!ops.includes(operations[i]) && operations[i].type == "onload"){
            // addMoves(parent, moves, ship, 9, 1, operations);
            let newOps = parent.ops;
            newOps.push(operations[i]);
            let open = findOpenCells(ship);
            for(let k = 0; k < open.length; k++) {
                let row = open[k][0];
                let col = open[k][1];
                let temp = ship;
                let problem = new Problem(ship);
                let dist = Math.abs(row - 9) + Math.abs(col - 0) + 2;
                let w = 0;
                let name = operations[i].name;
                temp[row][col] = {w, name};
                moves.push({
                    move: {
                        type: "onload",
                        name: operations[i].name,
                        time: dist,
                        oldRow: -1,
                        oldCol: -1,
                        newRow: row,
                        newCol: col,
                    },
                    problem: problem,
                    parent: parent,
                    ops: newOps,
                    cost: dist,
                })
            }
        }
    }
    return;
}
// queuing function or expand node function, find next state with operations 
function expandNode(curr, operations, frontier, visited) {
    let moves = [];
    let ship = curr.problem.grid;
    addOperations(curr, moves, ship, curr.ops, operations);
    // console.log(ship);
    for(let i = ship.length - 1; i >= 0 ; i--) {
        // console.log(ship[i]);
        for(let j = 0; j < ship[i].length; j++) {
            let container = ship[i][j];
            if(container.name === 'NAN' || container.name === 'UNUSED') {continue;}
            addMoves(curr, moves, ship, i, j, operations);
        }
    }
    for (let i = 0; i < moves.length; i++) {
        // console.log(moves[i]);
        let newNode = new LoadNode(moves[i].problem, moves[i].parent, moves[i].move, moves[i].cost, moves[i].ops);
        let cost = getCost(newNode);
        if(!visited.has((newNode, cost))){
            frontier.enqueue(newNode, cost);
        }
    }
    return;
}

function getCost(node) {
    return node.cost;
}
//heuristic manhanttan might be able to use balance heuristic function
function heuristic(state) {
    return 
}
//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 
//cost is based off of the time
export default function handleLoading(manifestText, operations) {
    let frontier = new priorityQueue();
    const visited = new Map();
    var solutionPath = [];

    // Note: right now, all this does is return the list of operations without any changes
    // This function will handle loading/unloading the containers. 
    // The data format of argument: manifestText <string>:
    // [row, col], {weight}, item
    // ...
    // [01, 02], {00000}, NAN
    // [01, 03], {00000}, NAN
    // [01, 04], {00120}, Ram
    // ....

    // Operations contain a list of onloading/offloading operations the user wants to perform
    // The data format of argument: operations
    // [{type, name}, {type, name}, ...]
    // [
    // ...
    // {type: "onload", name: "Dog"},
    // {type: "onload", name: "Cat"},
    // {type: "offload", name: "Beans"},
    // ...
    // ]
    
    // --------------------------------------------------
    // TODO: Implement ur search algorithm logic stuff here
    // ur code here (Remember to record ur screens!)
    let ship = processData(manifestText);
    let problem = new Problem(ship);
    const ops = [];
    let root = new LoadNode(problem, null, null, 0, ops);
    frontier.enqueue(root, 0);

    while(!frontier.isEmpty()){
        let curr = frontier.dequeue();
        let cost = curr.cost;
        if(goalTest(curr.getOps(), operations)){
            solutionPath = curr.path();
            break;
        }
        visited.set(curr, cost)
        expandNode(curr, operations, frontier, visited);

    }   
    // --------------------------------------------------

    // Return requirements:
    // List of operations the user should perform in order (each operation should have an estimated execution time in minutes)
    // Data format:
    // [{type, name, time, oldRow, oldColumn, newRow, newColumn}, ...]
    // [... 
    // {type: "move", name: "Beans", time: 1, oldRow: 1, oldColumn: 4, newRow: 1, newColumn: 5},
    // {type: "offload", name: "Beans", time: 12, oldRow: 1, oldColumn: 5, newRow: 0, newColumn: 0}, // Offload: Set newRow/newColumn to 0
    // {type: "onload", name: "Dog", time: 4, oldRow: 0, oldColumn: 0, newRow: 1, newColumn: 8}, // Onload: set oldRow/oldColumn to 0
    // ....]
    return solutionPath.map((move)=> ({
        ...move,
        oldRow: move.oldRow + 1,
        oldCol: move.oldCol + 1,
        newRow: move.newRow + 1,
        newCol: move.newCol + 1,
    }));
}

let text = `\
[01,01], {00000}, NAN
[01,02], {00000}, NAN
[01,03], {00000}, NAN
[01,04], {00120}, Ram
[01,05], {00000}, UNUSED
[01,06], {00000}, UNUSED
[01,07], {00000}, UNUSED
[01,08], {00000}, UNUSED
[01,09], {00035}, Owl
[01,10], {00000}, NAN
[01,11], {00000}, NAN
[01,12], {00000}, NAN
[02,01], {00000}, NAN
[02,02], {00050}, Dog
[02,03], {00000}, UNUSED
[02,04], {00000}, UNUSED
[02,05], {00000}, UNUSED
[02,06], {00000}, UNUSED
[02,07], {00000}, UNUSED
[02,08], {00000}, UNUSED
[02,09], {00000}, UNUSED
[02,10], {00000}, UNUSED
[02,11], {00000}, UNUSED
[02,12], {00000}, NAN
[03,01], {00040}, Cat
[03,02], {00000}, UNUSED
[03,03], {00000}, UNUSED
[03,04], {00000}, UNUSED
[03,05], {00000}, UNUSED
[03,06], {00000}, UNUSED
[03,07], {00000}, UNUSED
[03,08], {00000}, UNUSED
[03,09], {00000}, UNUSED
[03,10], {00000}, UNUSED
[03,11], {00000}, UNUSED
[03,12], {00000}, UNUSED
[04,01], {00000}, UNUSED
[04,02], {00000}, UNUSED
[04,03], {00000}, UNUSED
[04,04], {00000}, UNUSED
[04,05], {00000}, UNUSED
[04,06], {00000}, UNUSED
[04,07], {00000}, UNUSED
[04,08], {00000}, UNUSED
[04,09], {00000}, UNUSED
[04,10], {00000}, UNUSED
[04,11], {00000}, UNUSED
[04,12], {00000}, UNUSED
[05,01], {00000}, UNUSED
[05,02], {00000}, UNUSED
[05,03], {00000}, UNUSED
[05,04], {00000}, UNUSED
[05,05], {00000}, UNUSED
[05,06], {00000}, UNUSED
[05,07], {00000}, UNUSED
[05,08], {00000}, UNUSED
[05,09], {00000}, UNUSED
[05,10], {00000}, UNUSED
[05,11], {00000}, UNUSED
[05,12], {00000}, UNUSED
[06,01], {00000}, UNUSED
[06,02], {00000}, UNUSED
[06,03], {00000}, UNUSED
[06,04], {00000}, UNUSED
[06,05], {00000}, UNUSED
[06,06], {00000}, UNUSED
[06,07], {00000}, UNUSED
[06,08], {00000}, UNUSED
[06,09], {00000}, UNUSED
[06,10], {00000}, UNUSED
[06,11], {00000}, UNUSED
[06,12], {00000}, UNUSED
[07,01], {00000}, UNUSED
[07,02], {00000}, UNUSED
[07,03], {00000}, UNUSED
[07,04], {00000}, UNUSED
[07,05], {00000}, UNUSED
[07,06], {00000}, UNUSED
[07,07], {00000}, UNUSED
[07,08], {00000}, UNUSED
[07,09], {00000}, UNUSED
[07,10], {00000}, UNUSED
[07,11], {00000}, UNUSED
[07,12], {00000}, UNUSED
[08,01], {00000}, UNUSED
[08,02], {00000}, UNUSED
[08,03], {00000}, UNUSED
[08,04], {00000}, UNUSED
[08,05], {00000}, UNUSED
[08,06], {00000}, UNUSED
[08,07], {00000}, UNUSED
[08,08], {00000}, UNUSED
[08,09], {00000}, UNUSED
[08,10], {00000}, UNUSED
[08,11], {00000}, UNUSED
[08,12], {00000}, UNUSED`;
let shipGrid = processData(text);
let testOperations = [
    {type: "onload", name: "Bat"},
    ];
let testRes = handleLoading(text, testOperations);
console.log(testRes);