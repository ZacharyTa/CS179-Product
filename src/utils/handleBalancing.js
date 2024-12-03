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

       // console.log(`Processing cell (${row}, ${col}), time: ${time}`);
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
    console.log(`Cannot reach from (${r}, ${c}) to (${i}, ${j}), returning 10000`);
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
                cost: c,
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



//helper function to get locations of all containers
function containerLoc(grid){

    var locations = [];
    for(var i = 0; i < grid.length; i ++){
        for(var j = 0; j < grid.length; j++){

            if(grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED")
                locations.push({
                    name: grid[i][j].name,
                    row: i,
                    col: j
            })
        }
    }
    return locations
}



//without weights, works, but could be faster
function heuristic(problem) {
  
    // var weightDiff = Math.abs(weights.left_weight - weights.right_weight); // Current imbalance
    
    // The total cost that will be returned
    var cost = 0;

    var containers = containerLoc(problem.grid);

    var moves = getMoves(problem.grid);
    var minCost = Number.MAX_SAFE_INTEGER;

    // Explore all moves
    for (var move of moves) {
        var currName = move.name;
        for (var m of move.moves) {
            // Simulate the move to create a new grid
            var newGrid = problem.getNewGrid(problem.grid, m);
            craneTime = 0;

            //compute "crane time"
            if (currName !== m.name){
                //WORKING ON THIS RIGHT NOW SO IGNORE
                // var loc = containers.find(loc => {row, col} => loc.name === currName); 
                craneTime = findTime(newGrid, )
            }


            // Calculate the new weights for the new grid
            var newWeights = calc_weights(newGrid); 
            var newWeightDiff = Math.abs(newWeights.left_weight - newWeights.right_weight);

           
            var mCost = m.time + cost + newWeightDiff*.001 + craneTime;

            minCost = Math.min(minCost, mCost); // Track the minimum estimated cost
        }
    }

    // Add the minimum cost for the best move to the heuristic
    cost += minCost;

    return cost;
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
    for(var i = 0; i < weights.length; i++){
        totalWeight += weights[i];
    }

    console.log("total weight: ", totalWeight)

    if (weights.length === 1){
        return false;
    }

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




function SIFT (ship){
    return [];
}

//helper function, to test if parent grid is the root grid
// function compare(g, r){ //g = current Grid, r = root gridd

//     var status = true; //as in same
//     for (var i = 0; i < g.length; i++){
//         for(var j = 0; j < g[i].length; j++){
//             if (r[i][j] !== g[i][j]){
//                 status = false;
//                 return status;
//             }
//         }
//     }


//     return status; 

// }




//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 
export default function handleBalancing(manifestText) { 

    var frontier = new priorityQueue();   //frontier for A*
    var visited = new Map();              //keep track of visited nodes
    var solutionPath = [];



    // ship grid; returns an 8x12 grid
    var ship = processData(manifestText); 

    //if grid is empty or grid is already balanced, return empty solutionPath
    var pre_check_w= calc_weights(ship);
    var containers = getAllWeights(ship);
    if (containers.length == 0 || checkBalance(pre_check_w)){ return [];}

    //check for solvability, if not, call SIFT
    var solvability = isSolvable(ship);
    if (!solvability){
        solutionPath = SIFT(ship);
        return solutionPath;
    }


    //ship is solvable, start A*

    var p = new Problem(ship); 
    var root = new Node(p, null, null, 0, null); //last null --> crane move
    frontier.enqueue(root, 0);


    //var crane = new Crane();

  
    while(!frontier.isEmpty()){

        //set status of Crane
        var status = true; 

        var currNode = frontier.dequeue(); 
        var weights = calc_weights(currNode.problem.grid);
 

        if (checkBalance(weights)) {  //goal reached
            solutionPath = currNode.path();
            break;  
        }
        
        var gridHash = hashGrid(currNode.problem.grid);
        if(!visited.has(gridHash) || visited.get(gridHash) > currNode.cost){
         
            visited.set(gridHash, currNode.cost); 

            //get possible moves
            var moves = getMoves(currNode.problem.grid)
            // console.log("moves for expanded node: ", moves)


            for(var m of moves){
                for( var i of m.moves){

                    var newGrid = currNode.problem.getNewGrid(currNode.problem.grid, i);
                    var newP = new Problem(newGrid)
                    // var newCost = currNode.cost + i.cost;

                    //determine if crane is starting or not
                    // var status = compare (newGrid, ship);
                    var craneTime = 0;
                    var craneMove = {};

                    if (currNode.cost === 0){ //when crane should start at initial position 
                        //since from top, just manhattan distance
                        craneTime = Math.abs(9 - i.oldRow) + Math.abs(0 - i.oldColumn);
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
                        //oly compute crane if i.name != cm Move name!
                        //console.log ("cm name: ", mm.name, " i name: ", i.name);
                        //if( cm.name !== mm.name &&(mm.newRow != i.oldRow && mm.newColumn != i.oldColumn)){
                        if (cm.name !== mm.name && (mm.newRow !== i.oldRow || mm.newColumn !== i.oldColumn)) {
                             //if move now is looking at a different container then crane needs to compute the 
                             //time it takes from reaching new container from old container
                            craneTime =  findTime(newGrid, mm.newRow, mm.newColumn, i.oldRow, i.oldColumn);
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


                    var newCost = currNode.cost + i.cost + craneTime;

                    var child = new Node(newP, currNode, i, newCost, craneMove);

                    var h = heuristic(newP)


                    var frontierPriority = h + newCost + craneTime;
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