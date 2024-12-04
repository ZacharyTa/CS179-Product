// logic for handling the A* search algo smth


import {Problem, Node, processData, hashGrid} from './problem.js'
import {priorityQueue} from './priority.js'
import * as Sift from "./Sift.js"

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

    var nom = Math.abs(weights.right_weight - weights.left_weight);
    var den = (weights.left_weight + weights.right_weight) / 2;

    var tot = (nom / den ) * 100;

    if (tot <= 10.0){
        return true;
    }
    else{
        return false;
    }
 
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
            var c = Math.abs(row - targetRow) + Math.abs(col - j); // Manhattan distance
            var t = findTime(grid, row, col, targetRow, j); // Find time with obstacles

            moves.push({
                type: "move",
                name: grid[row][col].name,
                oldRow: row,
                oldColumn: col,
                newRow: targetRow,
                newColumn: j,
                cost: t,
                time: t,
            });
        }
    }

    return moves;
}

 
//using validateMoves, returns all moves for all containers (in 1 grid)
export function getMoves(grid){
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
    //console.log("ALLMOVES: ", allMoves);
    return allMoves

}


//without weights, works, but could be faster
function heuristic(problem) {
    // var weights = calc_weights(problem.grid);  
    // var weightDiff = Math.abs(weights.left_weight - weights.right_weight); // Current imbalance
    
    // The total cost that will be returned
    var cost = 0;

    // Add weight difference directly (focus on minimizing imbalance)
    // cost +=  weightDiff; 

    var moves = getMoves(problem.grid);
    var minCost = Number.MAX_SAFE_INTEGER;

    // Explore all moves
    //for each move
    for (var move of moves) {
        for (var m of move.moves) {
            // Simulate the move to create a new grid
            var newGrid = problem.getNewGrid(problem.grid, m);

            // Calculate the new weights for the new grid
            var newWeights = calc_weights(newGrid); 
            var newWeightDiff = Math.abs(newWeights.left_weight - newWeights.right_weight);
         
            //var manhattanDist = Math.abs(m.oldRow - m.newRow) + Math.abs(m.oldColumn - m.newColumn);
            var mCost = m.time + cost + newWeightDiff*.001; //manhattanDist;

            minCost = Math.min(minCost, mCost); // Track the minimum estimated cost
        }
    }

    // Add the minimum cost for the best move to the heuristic
    cost += minCost;

    return cost;
}



// false - only 1 container or unsolvable
// true - if solvable
function isSolvable(ship) {
    var weights = [];
    var totalWeight = 0;

    for (var i = 0; i < ship.length; i++) {
        for (var j = 0; j < ship[i].length; j++) {
            if (ship[i][j] !== "NAN" && ship[i][j] !== "UNUSED") {
                weights.push(ship[i][j].w);
                totalWeight += ship[i][j].w;
            }
        }
    }

    // if  only one container, it can't be balanced
    if (weights.length === 1) {
        return false;
    }

   
    var halfTotalWeight = Math.floor(totalWeight / 2);
    var dp = Array(halfTotalWeight + 1).fill(false);
    dp[0] = true; // 0 weight is always achievable

    for (var i = 0; i < weights.length; i++) {
        for (var j = halfTotalWeight; j >= weights[i]; j--) {
            if (dp[j - weights[i]]) {
                dp[j] = true;
            }
        }
    }


    for (var leftWeight = 0; leftWeight <= halfTotalWeight; leftWeight++) {
        if (dp[leftWeight]) {
            var rightWeight = totalWeight - leftWeight;

           
            if (
                leftWeight >= 0.9 * rightWeight &&
                leftWeight <= 1.1 * rightWeight
            ) {
                console.log(
                    `Solution found with leftWeight: ${leftWeight} and rightWeight: ${rightWeight}`
                );
                return true;
            }
        }
    }

    console.log("precheck: No valid solution");
    return false;
}






//Here is how SIFT is defined: Take all containers, and put them in the buffer. Logically, sort them by weight.
//Put the heaviest container in slot [01,06], put the second heaviest container in slot [01,07], put the third
//heaviest container in slot [01,05], put the fourth heaviest container in slot [01,08],.. Etc, until the first row is
//filled, then start on the second row, beginning with slot [02,06]….

//This describes what the goal state would be, but often you can do this without actually putting all the containers
//in the buffer. You just compute the goal state, and find the fastest path to get there, which may or may not
//involve moving some or all containers to the buffer.

//find fastest way to do this....

//so first, goal state: grid with highest to lowest
//to do this, we first sort all cargo 
//do astar branching with cost = time 
//heuristic being something related to goal state
//terminal is "isBalanced" for balancing, so in this case itll be "isSifted" in this case AKA goal state.

//in balancing, goal state is a simple equation. each state can be 
function SIFT (ship){
    console.log("UNSOLVABLE");
   
    return Sift.operateSift(ship);;
}




//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 
export default function handleBalancing(manifestText) { //A* search

    var frontier = new priorityQueue();         //frontier for A*
    var visited = new Map();                    //keep track of visited nodes
    var solutionPath = [];

   // var buffer = Array.from({length: 4}, ()=> new Array(24).fill("UNUSED")); //buffer space


    var ship = processData(manifestText); // ship grid; returns an 8x12 grid

    var solvability = isSolvable(ship);

    if (!solvability){
        solutionPath = SIFT(ship)
        return solutionPath
    }

    
    var p = new Problem(ship); 
    var root = new Node(p, null, null, 0); 
    //console.log("root: ", root)
    frontier.enqueue(root, 0);

  
    while(!frontier.isEmpty()){

        var currNode = frontier.dequeue(); 
        var weights = calc_weights(currNode.problem.grid);

        // console.log("node grid expanded:", currNode.problem.grid);
        // console.log("weights: ", weights);
        // console.log("current g: ", currNode.cost)
        // console.log("frontier priority value: ",frontier.values[1] )
 

        if (checkBalance(weights)) {  //goal reached
            console.log("balanced: ", currNode);
            solutionPath = currNode.path();
            console.log("path: ", solutionPath);
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
                    var newCost = currNode.cost + i.cost;
                    var child = new Node(newP, currNode, i, newCost);

                    var h = heuristic(newP)
                    // console.log("newP: ", newP)
                    // console.log("newP's h: ", h)

                    var frontierPriority = h + newCost;
                    // console.log("newP's frontierPriority: ", frontierPriority)

                    frontier.enqueue(child, frontierPriority); //currNode.cost is g(n)

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