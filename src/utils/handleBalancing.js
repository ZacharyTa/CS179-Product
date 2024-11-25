// logic for handling the A* search algo smth

import {Problem, Node, processData} from './problem.js'
import {priorityQueue} from './priority.js'

/**
 * TO DO:
 * 6) SIFT function (when balance not possible, and need to move all containers to buffer zone)
 * 
 * costs:
 *  within buffer and ship: 1 min per cell
 * transfer betw them: 4
 * 
 * index--> first cell is (1,1) (not 0,0)
 * bufferzone: reflect over x axis, EX: most right bottom corner" (1,-1)
 */

//calculate weights, and return them
function calc_weights(grid){
    var left_weight = 0;
    var right_weight = 0;

    for (var i = 0; i < grid.length; i++){
        for(var j= 0; j < grid[i].length; j++){
            if (grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED"){
                //compute left weights
                if (j < 6) left_weight += grid[i][j].w;
                else right_weight += grid[i][j].w;
            }
        }
    }
    return {left_weight, right_weight}
}

//check currrent weight sides of ship to goal weight
function checkBalance(weights){ 

    var isBalanced = false;
    if(Math.abs(weights.left_weight - weights.right_weight) <= 2){
        isBalanced = true;
    }

    return isBalanced;
}



//simply returns valid moves for 1 container
function validateMoves(grid, row, col){ //coordinate of container
    
    var moves = []; //store starting and ending locations

    for(var j = 0; j < grid[0].length; j++){     
        for(var i =0; i < grid.length; i++){
            if(grid[i][j].name === "UNUSED" && j !== col){

                var t = Math.abs(row-i) + Math.abs(col-j);
                moves.push({
                    type: "move",
                    name: grid[row][col].name,
                    oldRow: row ,
                    oldColumn: col,
                    newRow: i ,
                    newColumn:j,
                    time: t,
                });
                break;
            }
        }
    }

    return moves;

}

//using validateMoves, returns all moves for all containers (in 1 grid)
function getMoves(grid){
    var allMoves = [];
    for(var i = 0; i < grid.length; i++){
        for(var j = 0; j < grid[i].length; j++){

            if(grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED" ){
                var no_containerTop = i === grid.length - 1 || grid[i+1][j].name === "UNUSED";
                if(no_containerTop){
                    allMoves.push({
                        moves: validateMoves(grid, i, j),
                    })
                }
            }
        }
    }

    return allMoves

}

//heuristic  --> estimate min time to from current state to balance ship
function heuristic(problem) {
    const { left_weight, right_weight } = calc_weights(problem.grid);
    const weightDifference = Math.abs(left_weight - right_weight); // Penalty for weight imbalance

    const moves = getMoves(problem.grid); 
    let minTime = Number.MAX_SAFE_INTEGER; 

    for (const move of moves) {
        for (const m of move.moves) {
            const manhattanTime = Math.abs(m.oldRow - m.newRow) + Math.abs(m.oldColumn - m.newColumn); // Manhattan distance
            const totalCost = manhattanTime + weightDifference; // Combine cost of move and imbalance penalty

            minTime = Math.min(minTime, totalCost); // Track minimum cost
        }
    }

    return minTime;
}

function serialize(grid) {
    return grid.map(row => row.map(cell => cell.name).join(',')).join('|');
}


//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 

export default function handleBalancing(manifestText) { //A* search

    var frontier = new priorityQueue();         //frontier for A*
    var visited = new Set();                    //keep track of visited nodes
    const optimalOperations = [];   //returns the optimal solution (based on time)
    var solutionPath = [];

    var buffer = Array.from({length: 4}, ()=> new Array(24).fill("UNUSED")); //buffer space


    var ship = processData(manifestText); // ship grid; returns an 8x12 grid
    var p = new Problem(ship); 
    var root = new Node(p, null, null, 0); 
    frontier.enqueue(root, 0);

    

    while(!frontier.isEmpty()){

        var currNode = frontier.dequeue(); 
        var weights = calc_weights(currNode.problem.grid);

        if (checkBalance(weights)) {  //goal reached
            solutionPath = currNode.path();
            break;  
        }
        
        //need to serialize first since complex data for visited map!!!
        var gridSerial = serialize(currNode.problem.grid);
        if(!visited.has(gridSerial)){
            visited.add(gridSerial);

            //get possible moves
            var moves = getMoves(currNode.problem.grid)

            for(var m of moves){
                for( var i of m.moves){

                    var newGrid = currNode.problem.getNewGrid(currNode.problem.grid, i);
                    var newP = new Problem(newGrid)
                    var newCost = currNode.cost + i.time;
                    var child = new Node(newP, currNode, i, newCost);

                    frontier.enqueue(child, newCost + heuristic(newP)); //currNode.cost is g(n)

                }
            }
        }
    }


    //Will, check here if solutionPath is null to check if SIFT needs to be used
    //if there is no solution, solutionPath = null after exiting while loop
    //console.log(solutionPath);

    if(solutionPath === null){
        //process results ---> add type: move && shift results (no 0 indexing)
        console.error("No solution found. Will use SIFT");

    }
    else{
        return solutionPath.map(move => ({
            ...move,
            oldRow: move.oldRow + 1, // Already adjusted in validateMoves
            oldColumn: move.oldColumn + 1,
            newRow: move.newRow + 1,
            newColumn: move.newColumn + 1,
        }));
    }
    

    //return solutionPath;
}





// Return requirements:
// List of operations the user should perform in order (each operation should have an estimated execution time in minutes)
// Data format:
// [{type, name, time, oldRow, oldColumn, newRow, newColumn}, ...]
// [...
// {type: "move", name: "Ram", time: 4, oldRow: 1, oldColumn: 4, newRow: 1, newColumn: 8},
// {type: "move", name: "Cat", time: 1, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 4},
// {type: "move", name: "Dog", time: 2, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 5},
// ....]