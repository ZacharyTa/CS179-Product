// logic for handling the A* search algo smth
// import { Problem, Node, processData, hashGrid} from './problem.js'
import {Problem, Node, processData, hashGrid} from './problemSift.js'
import {priorityQueue} from './priority.js'
import {operateSift, getMoves, heuristic} from './Sift.js'
import {findTime, calculate_cranetime} from './balanceHelpers.js'


/**
 * costs:
 *  within buffer and ship: 1 min per cell
 * transfer betw them: 4
 * bufferzone: reflect over x axis, EX: most right bottom corner" (1,-1)
 */


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

function calculate_percentage_diff(weights) {

    var nom = Math.abs(weights.right_weight - weights.left_weight);
    var den = (weights.left_weight + weights.right_weight) / 2;
    var tot = (nom / den ) * 100;
    return tot;
 
}

//"total mass of the port side, and the total mass of the starboard side are within ten percent of each other."
function checkBalance(weights) {

    var nom = Math.abs(weights.right_weight - weights.left_weight);
    var den = (weights.left_weight + weights.right_weight) / 2;
    var tot = (nom / den ) * 100;
    if (tot <= 10.0){return true;}
    else{ return false;}
 
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
function heuristic_percentage(grid){
    let weights = calc_weights(grid);
    var nom = Math.abs(weights.right_weight - weights.left_weight);
    var den = (weights.left_weight + weights.right_weight) / 2;
    var tot = (nom / den ) * 100;
    return tot;
}


function heuristic_alternative(child) { //node

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



function updateSol(solutionPath) {

    solutionPath.forEach((move) =>{
        move.oldRow += 1, 
        move.oldColumn += 1,
        move.newRow += 1,
        move.newColumn += 1;

        if (move.type === "buffer1"){
            move.newColumn  = -move.newColumn;
            move.type = "buffer"
        }

        if (move.type === "buffer2"){
            move.newColumn  = -move.newColumn;
            move.oldColumn  = -move.oldColumn
            move.type = "buffer"
        }

        if (move.type === "buffer3"){
            move.oldColumn  = -move.newColumn
            move.type = "buffer"
        }


    });

    return solutionPath;
   
}



//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 
export default function handleBalancing(manifestText) { 

    var frontier = new priorityQueue();    // frontier for A*
    var visited = new Map();               // keep track of visited nodes
    var solutionPath = [];                 // stores solution to be returned
    var ship = processData(manifestText);  // ship grid; returns an 8x12 grid
    var optimal_cost = Infinity;
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
        // console.log("current weights: ", weights)
        // console.log ("moves: ", currNode.move, currNode.craneMove, currNode.bufferMove)
       
        //had the wrong idea
        //if it clears, check if its optimaler.
        if (checkBalance(weights) && currNode.problem.bufferEmpty() ) {  //goal reached
            console.log("checking for stopping condition");
            
            if ( optimal_cost > currNode.cost){
                solutionPath = currNode.path();
                optimal_cost = currNode.cost;
                console.log("solution: ", solutionPath)
            }

            
        }

        var gridHash = hashGrid(currNode.problem);

        if ((!visited.has(gridHash) || visited.get(gridHash) > currNode.cost)) {
            visited.set(gridHash, currNode.cost); 

            //get possible moves
            var moves = getMoves(currNode.problem) //if enabled, should have buffer moves
            for(var m of moves){
                for( var i of m.moves){
                    //if this move's total cost is more expensive, disregard.
                    if ((currNode.cost + i.cost) > optimal_cost) continue;

                    let craneTime = calculate_cranetime(currNode, i);
                    
                    i.time+= craneTime;
                    var newCost = currNode.cost + i.cost+craneTime;
                    if ((newCost) > optimal_cost) continue;
                    
                    var [newGrid, newBuffer] = currNode.problem.getNewGrids(currNode.problem.grid, currNode.problem.buffer, i);
                    var newP = new Problem(newGrid, newBuffer);
                    var child = new Node(newP, currNode, i, newCost, null);
                    var h = heuristic_percentage(newP.grid);

                    var frontierPriority = h + newCost;
                    frontier.enqueue(child, frontierPriority); //currNode.cost is g(n)
                }
            }
        }
    }
        var lastElement = {"newRow":9, "newColumn":1};
        if (solutionPath.length >0){ //if not empty
            lastElement = solutionPath[solutionPath.length - 1];
            console.log("solution path 1 : ", lastElement);
        }
        //time to move back to home
        var end = Math.abs(8 - lastElement.newRow) + Math.abs(0 - lastElement.newColumn);
       //lastElement.time += end;

    solutionPath.push({
        type:"Move crane to original position",
        name: "crane",
        oldRow: lastElement.newRow,
        oldColumn: lastElement.newColumn,
        newRow: 8,
        newColumn: 0,
        time: end,
        cost: 0, //removing 
    })

    return solutionPath.map(({ cost, ...move }) => ({
        ...move,
        oldRow: move.oldRow + 1, 
        oldColumn: (move.oldGrid === "buffer") ? -(move.oldColumn + 1) : (move.oldColumn+1),
        newRow: move.newRow + 1,
        newColumn: (move.newGrid === "buffer") ? -(move.newColumn+1) : (move.newColumn+1)
    }));
    

    
} //end handleBalancing