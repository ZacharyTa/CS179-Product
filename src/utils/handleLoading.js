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
    console.log(ops.length);
    console.log(operations.length);
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
        if(op.name === operations[i].name && operations.type == "offload"){
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
        console.log("we made it");
        let op = check[0];
        let type = op.type;
        if(type == "offload"){
            let newOps = Array.from(parent.ops);
            let m = {
                type: "offload",
                name: op.name,
                time: dist,
                oldRow: i,
                oldColumn: j,
                newRow: -1,
                newColumn: -1,
            };
            let dist = Math.abs(9-i) + Math.abs(0 - (j + 1)) + 2;
            let newGrid = ship.map(row =>row.map(cell => ({...cell})));
            newGrid[i][j] = {w: 0, name: "UNUSED"};
            let problem = new Problem(newGrid);
            newOps.push(check[0]);
            moves.push({
                move: m,
                problem: problem,
                parent: parent,
                ops: newOps,
                cost: dist + getCost(parent),
            })
        }
    }else {
        // let open = findOpenCells(ship);
        // for(let k = 0; k < open.length; k++){
        //     let row = open[k][0];
        //     let col = open[k][1];
        //     let temp = Array.from(ship);
        //     let w = 0;
        //     let name = ship[i][j].name;
        //     temp[row][col] = {w, name};
        //     let problem = new Problem(temp);
        //     let dist = Math.abs(row - i) + Math.abs(col - j);
        //     let newOps = Array.from(parent.ops);
        //     moves.push({
        //         move: {
        //             type: "move",
        //             name: name,
        //             time: dist,
        //             oldRow: i,
        //             oldColumn: j,
        //             newRow: row,
        //             newColumn: col,
        //         },
        //         problem: problem,
        //         parent: parent,
        //         ops: newOps,
        //         cost: dist + getCost(parent),
        //     })
        // }
    }
    return;
}

function printOps(ops) {
    let op = "";
    for (let i = 0; i < ops.length; i++){
        op += ops[i].name + " ";
    }
    return op
}
function addOperations(parent, moves, ship, ops, operations) {
    for (let i = 0; i < operations.length; i++){
        if(!ops.includes(operations[i]) && operations[i].type == "onload"){
            console.log(ops);
            console.log(`current operation selected: ${operations[i].name}`);
            // addMoves(parent, moves, ship, 9, 1, operations);
            let newOps = Array.from(ops);
            newOps.push(operations[i]);
            console.log(`current length after push: ${newOps.length}`)
            console.log(`current ops list: ${printOps(newOps)}`);
            console.log(`parent node: ${parent.cost}`);
            let open = findOpenCells(ship);
            for(let k = 0; k < open.length; k++) {
                let row = open[k][0];
                let col = open[k][1];
                let dist = Math.abs(row - 9) + Math.abs(col - 0) + 4;
                let m = {
                    type: "onload",
                    name: operations[i].name,
                    time: dist,
                    oldRow: -1,
                    oldColumn: -1,
                    newRow: row,
                    newColumn: col,
                }
                let newGrid = ship.map(row =>row.map(cell => ({...cell})));
                newGrid[m.newRow][m.newColumn] = {w: 0, name: m.name};
                let problem = new Problem(newGrid);
                moves.push({
                    move: m,
                    problem: problem,
                    parent: parent,
                    ops: newOps,
                    cost: dist + getCost(parent),
                });
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
        let newNode = new LoadNode(moves[i].problem, moves[i].parent, moves[i].move, moves[i].cost, moves[i].ops);
        console.log(`when making new node length of ops: ${newNode.getOps().length}`);
        let cost = getCost(newNode);
        let hash = hashGrid(newNode.problem.grid)
        console.log(`has been visited: ${visited.has(hash)}`);
        if(!visited.has((hash, cost))){
            frontier.enqueue(newNode, cost);
        }
    }
    return;
}

function getCost(node) {
    return node.cost;
}
//heuristic manhanttan might be able to use balance heuristic function
function heuristic(node) {

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
    let curr;
    while(!frontier.isEmpty()){

        curr = frontier.dequeue();
        let cost = getCost(curr);
        if(goalTest(curr.getOps(), operations)){
            solutionPath = curr.path();
            break;
        }
        visited.set((hashGrid(curr.problem.grid), cost));
        // console.log(visited);
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
    if(solutionPath.length == 0){
        console.log("none found");
    }
    return solutionPath.map((move)=> ({
        ...move,
        oldRow: move.oldRow + 1,
        oldColumn: move.oldColumn = 1,
        newRow: move.newRow + 1,
        newColumn: move.newColumn + 1,
    }));
}

let text = `\
[01,01], {10001}, Ewe
[01,02], {00500}, Cow
[01,03], {00600}, Dog
[01,04], {00100}, Rat
[01,05], {00000}, UNUSED
[01,06], {00000}, UNUSED
[01,07], {00000}, UNUSED
[01,08], {00000}, UNUSED
[01,09], {00000}, UNUSED
[01,10], {00000}, UNUSED
[01,11], {00000}, UNUSED
[01,12], {00000}, UNUSED
[02,01], {09041}, Cat
[02,02], {00010}, Doe
[02,03], {00000}, UNUSED
[02,04], {00000}, UNUSED
[02,05], {00000}, UNUSED
[02,06], {00000}, UNUSED
[02,07], {00000}, UNUSED
[02,08], {00000}, UNUSED
[02,09], {00000}, UNUSED
[02,10], {00000}, UNUSED
[02,11], {00000}, UNUSED
[02,12], {00000}, UNUSED
[03,01], {00000}, UNUSED
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
let testOperations = [
    {type: "offload", name: "Rat"},
    // {type: "onload", name: "Bat"},
    // {type: "offload", name: "Cow"},
    ];
let testRes = handleLoading(text, testOperations);
console.log(testRes);