// logic for handling the A* search algo smth

import {Problem, Node, processData, hashGrid} from './problem.js'
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



//"total mass of the port side, and the total mass of the starboard side are within ten percent of each other."
function checkBalance(weights) {

    //const maxWeight = Math.max(weights.left_weight, weights.right_weight);
    var totalWeight = weights.left_weight + weights.right_weight;
    var weightDifference = Math.abs(weights.left_weight - weights.right_weight);

    if(weightDifference <= 0.1 * totalWeight){ return true; }
    else{ return false;}
}


function findTime(grid, r, c, i ,j){
    //directions
    var dir = [ {row: 1, col: 0 },
                {row: -1, col: 0},
                {row: 0, col: -1},
                {row: 0, col: 1 }]

    var q = [{row: r, col: c, time: 0}];
    var seen = new Set();
    seen.add(`${r}-${c}`);

    while (q.length > 0){
        //if end and start are the same then done
        var {row, col, time} = q.shift();
        if(row === i && col ===j){return time;}
        
        for( var{row: dr, col: dc} of dir){
            var newR = row + dr;
            var newC = col + dc;
            // if with grid bounds
            if(newR >=0 && newR < grid.length && newC >= 0 && newC < grid[0].length){
                //if not visited and available to be moved to (so no nan or other containers)
                if (!seen.has(`${newR}-${newC}`) && grid[newR][newC].name === "UNUSED"){
                    seen.add(`${newR}-${newC}`);
                    q.push({row: newR, col: newC, time:time + 1});
                }
            }
        }
    }

    return 10000; 
}




//simply returns valid moves for 1 container
function validateMoves(grid, row, col) { 
    var moves = []; 

    for (var j = 0; j < grid[0].length; j++) {
        if (j === col) continue; 

        // Find the "lowest" available position 
        let targetRow = -1; 
        for (var i = 0; i < grid.length; i++) {
            if (grid[i][j].name === "UNUSED") {
                if (i === 0 || grid[i - 1][j].name !== "UNUSED") {
                    targetRow = i; 
                    break;
                }
            }
        }

        // If a valid row 
        if (targetRow !== -1) {
            // var c = Math.abs(row - targetRow) + Math.abs(col - j); // Manhattan distance
            var t = findTime(grid, row, col, targetRow, j); // Find time with obstacles

            moves.push({
                type: "move",
                name: grid[row][col].name,
                oldRow: row,
                oldColumn: col,
                newRow: targetRow,
                newColumn: j,
                // cost: c,
                time: t,
            });
        }
    }

    return moves;
}



 
//using validateMoves, returns all moves for all containers (in 1 grid)
function getMoves(grid){
    var allMoves = [];
    for(var i = 0; i < grid.length; i++){
        for(var j = 0; j < grid[i].length; j++){
            const container = grid[i][j];
            if(container && grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED" ){
                var no_containerTop = i === grid.length - 1 || grid[i+1][j].name === "UNUSED";

                if(no_containerTop){
                    
                    allMoves.push({
                        moves: validateMoves(grid, i, j),
                        
                    } )
                }
            }
        }
    }

    return allMoves

}

//heuristic  --> estimate min time to from current state to balance ship
function heuristic(problem) {
   
    var max = Number.MAX_SAFE_INTEGER;
    var weights = calc_weights(problem.grid);  
    var weightDiff = Math.abs(weights.left_weight - weights.right_weight); // Current imbalance
    
    //the total cost that will be returned
    var cost = 0; 

    // Add  the weight cost going to emphasize more on current weight diff 
    cost += 2 * weightDiff; 

    var moves = getMoves(problem.grid);
    for (var move of moves) {
        for (var m of move.moves) {
            //get the new move that would be made
            var newGrid = problem.getNewGrid(problem.grid, m);

            //calculate the new weights now for newGrid
            var newWeights = calc_weights(newGrid); 
            var newWeightDiff = Math.abs(newWeights.left_weight - newWeights.right_weight);

            //prioritize solutions closer to center (ex: doe)
            var colDist = Math.abs(m.newColumn - 7);
            var mCost = m.time + 2 * newWeightDiff + colDist;
            max = Math.min(max, mCost);
        }
    }


    cost += max;
    return cost;
}



// function isSolvable(ship){

//     //will return true or false
// }


// function SIFT (ship){

// }




//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 
export default function handleBalancing(manifestText) { //A* search

    var frontier = new priorityQueue();         //frontier for A*
    var visited = new Map();                    //keep track of visited nodes
    var solutionPath = [];

   // var buffer = Array.from({length: 4}, ()=> new Array(24).fill("UNUSED")); //buffer space


    var ship = processData(manifestText); // ship grid; returns an 8x12 grid



    /************************************ after isSolvable is done *****************/
    //once isSolvable done, changing the return 
    // var solvability = isSolvable(ship);
    // if (!solvability){
    //     solutionPath = SIFT(ship)
    //     return solutionPath
    // }

    

    var p = new Problem(ship); 
    var root = new Node(p, null, null, 0); 
    frontier.enqueue(root, 0);

  
    while(!frontier.isEmpty()){

        var currNode = frontier.dequeue(); 
        var weights = calc_weights(currNode.problem.grid);

        // console.log("node grid expanded:", currNode.problem.grid);
        // console.log("weights: ", weights);
 

        if (checkBalance(weights)) {  //goal reached
            solutionPath = currNode.path();
            break;  
        }
        
        var gridHash = hashGrid(currNode.problem.grid);
        if(!visited.has(gridHash) || visited.get(gridHash) > currNode.cost){
            // console.log("was not visited already")
            visited.set(gridHash, currNode.cost); 

            //get possible moves
            var moves = getMoves(currNode.problem.grid)
            // console.log("moves for expanded node: ", moves)

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
        // console.log("was visited already")
    }

    // console.log("out of while loop")




    //will delete the if part since will be handle before entering A* loop
    if(solutionPath === null){
        //process results ---> add type: move && shift results (no 0 indexing)
        console.error("No solution found. Will use SIFT");
        return [] //delete later

        //call shift from here

    }
    else{
        return solutionPath.map((move)=> ({
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