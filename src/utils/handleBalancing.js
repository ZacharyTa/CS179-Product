// logic for handling the A* search algo smth
// import { Problem, Node, processData, hashGrid} from './problem.js'
import { processData, hashGrid} from './problem.js'
import {priorityQueue} from './priority.js'
import {operateSift} from './Sift.js'

/**
 * costs:
 *  within buffer and ship: 1 min per cell
 * transfer betw them: 4
 * bufferzone: reflect over x axis, EX: most right bottom corner" (1,-1)
 */

/**
 * Temporary -- checking
 */
//class to represent Problem states (tree structure)
class Problem{
    
    // constructor(ship, buffer){
    constructor(ship, buffer){        
        this.grid = ship;
        this.buffer = buffer;
   
    }

    // setTime(time) { this.time = time;}
    getGrid(){return this.grid;}
    getTime(){return this.time;}

    //function to return a grid with a new move; 
    //still need to distinguish RIP
    getNewGrid(grid, move){
        var newGrid = grid.map(row =>row.map(cell => ({...cell})));
        var container = newGrid[move.oldRow][move.oldColumn];
     
        newGrid[move.oldRow][move.oldColumn] = {name: "UNUSED", w: 0}; //old spot should now be unused
        newGrid[move.newRow][move.newColumn]= container;

        return (newGrid);

    }

    bufferEmpty(){

        for(var i = 0; i < this.buffer.length; i++){
            for(var j = 0; j < this.buffer[i].length; j++){
                if (this.buffer[i][j].name !== "UNUSED"){
                    return false;
                }
            }
        }

        return true;
    }

    
}


//Node structure 
class Node{

    constructor(problem, parent, move, cost, craneMove, bufferMove){
    // constructor(problem, parent, move, cost, bufferMove){
        this.problem = problem;         
        this.parent = parent; 
        this.move = move,
        this.cost = cost;
        this.craneMove = craneMove; //only if the containers are different
                                    //else pass [] (gets taken care of in path())
        this.bufferMove = bufferMove;
        
    }

    getCraneMove (){ return this.craneMove;}
    getMove(){return this.move; }
    getBufferMove(){return this.bufferMove}


    path() {
        const path = [];
        let currNode = this;
    
        //add container move
        while (currNode.parent != null) {
            if (currNode.move != null && !isNaN(currNode.move.newRow) && !isNaN(currNode.move.newColumn)) {
                path.unshift(currNode.move);
                //add crane time
                if (currNode.craneMove != null && !isNaN(currNode.craneMove.newRow) && !isNaN(currNode.craneMove.newColumn)) {
                    //path.unshift(currNode.craneMove);
                    currNode.move.time = (currNode.move.time || 0) + currNode.craneMove.time;
                }
            }

            //add buffer move
            if (currNode.bufferMove != null && !isNaN(currNode.bufferMove.newRow) && !isNaN(currNode.bufferMove.newColumn)) {
                path.unshift(currNode.craneMove);
            }

            currNode = currNode.parent;
        }
    
        return path;
    }
    

}


//info[0] = [ x1 x2, 
//info[1] = y1 y2 ]
//info[1] = {xxxx}
//info[2] = "string"





//global var
var enable = false;


//calculate weights, and return them
function calc_weights(grid){
    var left_weight = 0;
    var right_weight = 0;

    for (var i = 0; i < grid.length; i++){
        for(var j= 0; j < grid[i].length; j++){
            if (grid[i][j] && grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED"){
                //compute left weights
                if (j < 6) left_weight += grid[i][j].w;
                else right_weight += grid[i][j].w;
            }
        }
    }
    return {left_weight, right_weight}
}



//"total mass of the port side, and the total mass of the starboard side are within ten percent of each other."
function checkBalance(weights) {

    var nom = Math.abs(weights.right_weight - weights.left_weight);
    var den = (weights.left_weight + weights.right_weight) / 2;
    var tot = (nom / den ) * 100;
    if (tot <= 10.0){return true;}
    else{ return false;}
 
}

function findTime(grid, r, c, i, j) {
    const directions = [
        { row: 1, col: 0 },
        { row: -1, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: -1 }
    ];

    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [{ row: r, col: c, time: 0 }];
    visited[r][c] = true;

    while (queue.length > 0) {
        const { row, col, time } = queue.shift();
        if (row === i && col === j) return time;

        for (const { row: dr, col: dc } of directions) {
            const newR = row + dr;
            const newC = col + dc;

            if (
                newR >= 0 &&
                newR < rows &&
                newC >= 0 &&
                newC < cols &&
                !visited[newR][newC] &&
                grid[newR][newC].name === "UNUSED"
            ) {
                visited[newR][newC] = true;
                queue.push({ row: newR, col: newC, time: time + 1 });
            }
        }
    }

    return 10000; // large value for deprioritization
}




//simply returns valid moves for 1 container
//if buffer enabled, then moves from within grid, to moving containers TO buffer
function validateMoves(currNode, container, lowestUnused, bufferLowest) {  //this is the container in grid currently
    var moves = []; 

    var row = container.row
    var col = container.col
    var grid = currNode.problem.grid;
    var buffer = currNode.problem.buffer;

    for (var j = 0; j < grid[0].length; j++) {
        if (j === col) continue; 

        var targetRow = lowestUnused[j];
        if (targetRow !== null) {
            var c = Math.abs(row - targetRow) + Math.abs(col - j); // Manhattan distance
            var t = findTime(grid, row, col, targetRow, j); // Find time with obstacles

            moves.push({
                type: "move",
                name: grid[row][col].name,
                oldRow: row,
                oldColumn: col,
                newRow: targetRow,
                newColumn: j,
                cost: c,
                time: t,
            });
        }

    }

    //if enable = true
    if(enable === true){
        var outGridTime = Math.abs(row - 8) + Math.abs(col - 0) + 4;
        for (var j = 0; j < grid[0].length; j++) {

            if (j === col) continue; 

            var targetRow = bufferLowest[j];
            if (targetRow !== null) { 
                //t and c same always in this case (from 3,0) to each floor col of buffer space
                var c = Math.abs(3 - targetRow) + Math.abs(0 - j) + outGridTime; 
          
                moves.push({
                    type: "buffer1",
                    name: grid[row][col].name,
                    oldRow: row,
                    oldColumn: col,
                    newRow: targetRow,
                    newColumn: j,
                    cost: c,
                    time: c, 
                });
            }
            //testing break ---> dont need to add to all buffer bottoms floors maybe
    
        }

    } //if enabled, should be 11 + 24 moves

    return moves;
}



function availSpots(grid){
    var lowest = Array(grid[0].length).fill(null);

    for (var j = 0; j < grid[0].length; j++) {
        for (var i = 0; i < grid.length; i++) {
            if (grid[i][j].name === "UNUSED") {
                if (i === 0 || grid[i - 1][j].name !== "UNUSED") {
                    lowest[j] = i;
                    break;
                }
            }
        }
    }
    return lowest;
}


//using validateMoves, returns all moves for all containers (in 1 grid)
function getMoves(currNode){ 

    var grid = currNode.problem.grid;
    var buffer = currNode.problem.buffer;
    var allMoves = [];
    var bufferLowest= null;

    var gridLowest = availSpots(grid); //pre-get all locations to stop iterations
    bufferLowest = availSpots(buffer);
 
    //for all moves starting in the grid
    for(var i = 0; i < grid.length; i++){
        for(var j = 0; j < grid[i].length; j++){
            const container = {value: grid[i][j],row: i, col: j}; //issue when it came back from buffer, so diff dimensions RIP
            if(container && grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED" ){

                var no_containerTop = (i === grid.length - 1) || (grid[i+1][j].name === "UNUSED" ) ;
                if(no_containerTop){
                    var moves = validateMoves(currNode, container, gridLowest, bufferLowest);
                    if(moves != null){
                        allMoves.push({ moves: moves} ) //12 containers*24 moves each 
                    }
                }
            }
        }
    }

    //call function to get moves from buffer, if buffer is not empty
    if (enable === true){
        for (var i = 0; i < buffer.length; i++) {
            for (var j = 0; j < buffer[i].length; j++) {
                const container = { value: buffer[i][j], row: i, col: j };
                    if (container && buffer[i][j].name !== "NAN" && buffer[i][j].name !== "UNUSED") {
                        var noContainerTop = i === buffer.length - 1 || buffer[i + 1][j].name === "UNUSED";
                        if (noContainerTop) {
                            var moves = validateBuffers(currNode, container, gridLowest, bufferLowest);
                            if (moves != null) {allMoves.push({ moves: moves });
                        }
                    }
                }
            }
        }
    }
    return allMoves;
}



//helper functions for if containers need to be moved only within buffer
//and go to ship sgrid
function validateBuffers(currNode, container, gridLowest, bufferLowest){

    var moves = [];
    var buffer = currNode.problem.buffer;
    var grid = currNode.problem.grid;
    var row = container.row;
    var col = container.col;

    //all moves within buffer only
    for (var j = 0; j < buffer[0].length; j++) {
        if (j === col) continue; 
    
        // Find the "lowest" available position 
        let targetRow = bufferLowest[j]; 
        // If a valid row 
        if (targetRow !== null) {
            var c = Math.abs(row - targetRow) + Math.abs(col - j); // Manhattan distance
            var t = findTime(buffer, row, col, targetRow, j); // Find time with obstacles
            
            moves.push({
                type: "buffer2",
                name: buffer[row][col].name,
                oldRow: row,
                oldColumn: col,
                newRow: targetRow,
                newColumn: j,
                cost: c,
                time: t,
            });
            
        }
       //testing
       break;
    
    }

    var outBufferTime = Math.abs(row - 4) + Math.abs(col - 0) + 4; //4 min additional to transfer to grid
    for (var j = 0; j < grid[0].length; j++) {
          
        // Find the "lowest" available position 
        let targetRow = gridLowest[j]; 
        if (targetRow !== null) {                //0 1 2 3
                
            //specifically buffer moves that go to the grid (note to self, dont negate col!)
            var c = Math.abs(3 - targetRow) + Math.abs(0 - j) + outBufferTime; // Manhattan distance
            const mappedColumn = j % grid[0].length;
            moves.push({
                type: "buffer3",
                name: buffer[row][col].name,
                oldRow: row,
                oldColumn: col,
                newRow: targetRow,
                newColumn: mappedColumn,
                cost: c,
                time: c, //time to go from curr loc in grid to out of grid, + transfer time + to its loc in buffer
            });
        }

    }

    return moves;

}

//buffer1: going to buffer
//buffer2: within buffer
//buffer3: going to grid from the buffer

function heuristic(child) { //node

    var moves = getMoves(child); 
    var minCost = Number.MAX_SAFE_INTEGER;
    var problem = child.problem;

    var newBuffer = null;
    var newGrid = null;

    for (var move of moves) { //if enabled, then some moves are buffers!
        for (var m of move.moves) {

            if (enable === true) {

                var penalty = 0;
                if (m.type === "buffer2") { //moving within buffer
                    // newBuffer = bridgeMoves(problem.buffer, problem.buffer, m);
                    newGrid = problem.grid;

                    //deprioritize based on how far away from pink celll
                    penalty = (m.newColumn + 1)* 45; //case of at 0,0 

                }
                if (m.type === "buffer3") { //moving back to grid
                    var grids = bridgeMoves(problem.buffer, problem.grid, m);
                    newGrid = grids.grid2;
                    newBuffer = grids.grid1;

                    //compute weight diff!
                }
                if (m.type === "buffer1") { //moving to buffer
                    var grids = bridgeMoves(problem.grid, problem.buffer, m);
                    newGrid = grids.grid1;
                    newBuffer = grids.grid2;
                    penalty = (m.newColumn + 1)* 45;
                }
                if (m.type === "move") { //
                    newGrid = problem.getNewGrid(problem.grid, m);
                    newBuffer = problem.buffer;
                }

                var newWeights = calc_weights(newGrid);
                penalty = Math.abs(newWeights.left_weight - newWeights.right_weight);

                var mCost = m.time + m.cost + penalty;
                minCost = Math.min(minCost, mCost);

            } else { // Grid move only
                newGrid = problem.getNewGrid(problem.grid, m);
                var newWeights = calc_weights(newGrid);
                var newWeightDiff = Math.abs(newWeights.left_weight - newWeights.right_weight);
                var mCost = 2 * m.time + m.cost + newWeightDiff * 0.0001;
                minCost = Math.min(minCost, mCost); 
            }
        }
    }

    return minCost;
}







//helper function to only return an array of weights in a grid
function getAllWeights(grid){
    var weights = [];
    for(var i = 0; i < grid.length; i++){
        for (var j = 0; j < grid[i].length; j++){
            if(grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED"){
                weights.push(grid[i][j].w);
            }
        }
    }
    return weights;
}


// precheck function to return true or false if the initial grid is possible to balance
function isSolvable(ship){

    var weights = getAllWeights(ship);
    var totalWeight = 0;
    for(var i = 0; i < weights.length; i++){ totalWeight += weights[i]; }

    //if only 1 container, call sift
    if (weights.length === 1){ return false;}

    if(weights.length >=60){ enable = true;} //might change condition

    var totalWeightHalf = Math.floor(totalWeight/2);
    var dp = Array(totalWeightHalf + 1).fill(false);
    dp[0] = true; //since 0 weight always poss

    for(var i = 0; i < weights.length; i++){
        for( var j = totalWeightHalf; j >= weights[i]; j--){
            if(dp[j - weights[i]]){dp[j] = true;}
        }
    }

    for (var leftW = 0; leftW <= totalWeightHalf; leftW++){
        if(dp[leftW]){
            var rightW = totalWeight - leftW;
            if(leftW >= 0.9 * rightW && leftW <= 1.1 * rightW){
                console.log(`Sol found, leftW: ${leftW} and rightW: ${rightW}`);
                return true;
            }
        }
    }

    console.log("precheck--> no valid solution, calling sift.");
    return false;

}

//helper function to initialize buffer
function initialBuffer(){ //only 4 x 24
    var b = [];
    for(var i = 0; i < 4; i++){
        var r = []
        for(var j = 0; j < 24; j++){
            r.push({name: "UNUSED", w: 0});
        }
        b.push(r)
    }
    return b;
}


//grid1: old loc of container (updated to newGrid1)
//grid2: new loc of container (updated to newGrid2)
function bridgeMoves(grid1, grid2, m) {
    // Ensure deep copies to avoid shared references
    var newGrid1 = grid1.map(row => row.map(cell => ({ ...cell })));
    var newGrid2 = grid2.map(row => row.map(cell => ({ ...cell })));

    var container = newGrid1[m.oldRow][m.oldColumn];
    newGrid1[m.oldRow][m.oldColumn] = { name: "UNUSED", w: 0 }; 
    newGrid2[m.newRow][m.newColumn] = container;

    return { grid1: newGrid1, grid2: newGrid2 };
}



//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 
export default function handleBalancing(manifestText) { 

    var frontier = new priorityQueue();    // frontier for A*
    var visited = new Map();               // keep track of visited nodes
    var solutionPath = [];                 // stores solution to be returned
    var ship = processData(manifestText);  // ship grid; returns an 8x12 grid

    //if grid is empty or grid is already balanced, return empty solutionPath
    var pre_check_w= calc_weights(ship);
    var containers = getAllWeights(ship);
    if (containers.length == 0 || checkBalance(pre_check_w)){
        console.log("no solution, either empty or already balanced!");
        return [];
    }
    console.log("weights: ", pre_check_w)

    //check for solvability, if not, call SIFT
    var solvability = isSolvable(ship);
    if (!solvability){
        solutionPath = operateSift(ship);
        return solutionPath;
    }
    console.log("buffer enable status: ", enable);

    var buffer = initialBuffer();
    var p = new Problem(ship, buffer); 
    var root = new Node(p, null, null, 0, null, null); //constructor(problem, parent, move, cost, craneMove, bufferMove)
    frontier.enqueue(root, 0);


    while(!frontier.isEmpty()){
        var currNode = frontier.dequeue(); 
        var weights = calc_weights(currNode.problem.grid);
        console.log("current weights: ", weights)
        console.log("node expanded: ", currNode)

        if (checkBalance(weights) && currNode.problem.bufferEmpty() ) {  //goal reached
            console.log("checking for stopping condition");
            solutionPath = currNode.path();
            var lastElement = solutionPath[solutionPath.length - 1];

            //time to move back to home
            var end = Math.abs(8 - lastElement.newRow) + Math.abs(0 - lastElement.newColumn);
            lastElement.time += end;

            console.log("solution: ", solutionPath)
            break;  
        }


        var gridHash = hashGrid(currNode.problem.grid);
        var hashed = null;

        if (enable === true){
            var bufferHash = hashGrid(currNode.problem.buffer);
            hashed = gridHash + "-" + bufferHash;
        }else{
            hashed = gridHash;
        }

        if ((!visited.has(hashed) || visited.get(hashed) > currNode.cost)) {
            visited.set(hashed, currNode.cost); 

            //get possible moves
            var moves = getMoves(currNode) //if enabled, should have buffer moves
            for(var m of moves){
                for( var i of m.moves){

                    var newGrid = null;
                    var newBuffer = null;
                    if (enable === true){

                            //buffer1: going to buffer
                            //buffer2: within buffer
                            //buffer3: going to grid from the buffer

                            //if within buffer only
                            if(i.type === "buffer2"){
                                var grids = bridgeMoves(currNode.problem.buffer,currNode.problem.buffer, i)
                                newGrid = currNode.problem.grid;
                                newBuffer = grids.grid2
                            }
                             //if going from buffer to grid
                            else if(i.type === "buffer3"){
                                var grids = bridgeMoves(currNode.problem.buffer, currNode.problem.grid, i);
                                newGrid = grids.grid2;
                                newBuffer = grids.grid1;
                            }
                            //if going from grid to buffer
                           else if (i.type === "buffer1"){
                                var grids = bridgeMoves(currNode.problem.grid, currNode.problem.buffer, i);
                                newGrid = grids.grid1;
                                newBuffer = grids.grid2;
                            }
                            else if (i.type === "move"){

                                newGrid = currNode.problem.getNewGrid(currNode.problem.grid, i);
                                newBuffer = currNode.problem.buffer;
                            }
                            else{
                                console.log("Unexpected i type:", i.type);
                                console.log("move i: ", i)
                            }
                    }
                    else{
                        newGrid = currNode.problem.getNewGrid(currNode.problem.grid, i);
                        newBuffer = currNode.problem.buffer;
                    }
            
                    var newP = new Problem(newGrid, newBuffer);

                    //determine if crane is starting or not
                    var craneTime = 0;
                    var craneMove = null;
                    var bufferMove = null; //will pass null only if enable != true

                    if (currNode.cost === 0){ //when crane should start at initial position 
                        //add this time to each beginning moves
                        craneTime = Math.abs(8 - i.oldRow) + Math.abs(0 - i.oldColumn);
                        craneMove = {
                            type: "move",
                            name: "crane",
                            oldRow: 8, //to print 9 instead RIP
                            oldColumn: 0, 
                            newRow: i.oldRow, 
                            newColumn: i.oldColumn,
                            time: craneTime
                        };
                    } 
                    else{ //time from prev container to new container
                        var mm = currNode.getMove();
                        var cm = currNode.getCraneMove();
                        //only compute crane if mm.name != cm Move name! (container changes)
                        if (  !cm || cm.name !== mm.name && (mm.newRow !== i.oldRow || mm.newColumn !== i.oldColumn)) {
                            if (mm.type === "move"){
                                craneTime =  findTime(newGrid, mm.newRow, mm.newColumn, i.oldRow, i.oldColumn);
                            }
                            craneMove = {
                                type: "move",
                                name: "crane",
                                oldRow: mm.newRow, 
                                oldColumn: mm.newColumn, 
                                newRow: i.oldRow, 
                                newColumn: i.oldColumn,
                                time: craneTime
                            };    
                        } 
                    }

                    //deprioritizing craneTime, since initialCrane time has too much influence on the problem path
                    var newCost = currNode.cost + 0.5*i.cost; +  0.001*craneTime; 
                    var child = new Node(newP, currNode, i, newCost, craneMove, bufferMove);
                    var h = heuristic(child);

                    var frontierPriority = h + newCost;
                    frontier.enqueue(child, frontierPriority); //currNode.cost is g(n)
                }
            }
        }
    }

    if(solutionPath === null){
        console.error("No solution found. Will use SIFT");
        return [] ;
    }
    else{

        return solutionPath.map(({ cost, ...move }) => ({
            ...move,
            oldRow: move.oldRow + 1, 
            oldColumn: move.oldColumn + 1,
            newRow: move.newRow + 1,
            newColumn: move.newColumn + 1,
        }));
    }

} //end handleBalancing