// logic for handling the A* search algo smth


import {Problem, Node, processData, hashGrid} from './problem.js'
import {priorityQueue} from './priority.js'
import * as Sift from "./Sift.js"

/**
 * costs:
 *  within buffer and ship: 1 min per cell
 * transfer betw them: 4
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

    if (tot <= 10.0){return true;}
    else{ return false;}
 
}

//TODO: might need to add another row on top for calculations, shouldnt be too had
//find time between 2 points, with takng obstacles into mind
export function findTime(grid, r, c, i ,j){
    //directions
    var dir = [ {row: 1, col: 0 },
                {row: -1, col: 0},
                {row: 0, col: -1},
                {row: 0, col: 1 }]

    var q = [{row: r, col: c, time: 0}];
    var seen = new Set();
    seen.add(`${r}-${c}`);

    while (q.length > 0){
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
    return 10000; //to deprioritize inside frontier priority and heuristic
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
                weight: grid[row][col].w,
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
                    allMoves.push({ moves: validateMoves(grid, i, j)} )
                }
            }
        }
    }
    return allMoves

}




//without weights, works, but could be faster
//only simulating moving 1 container to another location, 
//so crane is moving with the container and will not be "moving between containers"
//craneTime not needed
function heuristic(problem) {

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

            var mCost = 2*m.time + m.cost +  newWeightDiff * 0.0001;
            minCost = Math.min(minCost, mCost); // Track the minimum estimated cost
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


    while(!frontier.isEmpty()){

        var currNode = frontier.dequeue(); 
        var weights = calc_weights(currNode.problem.grid);

        if (checkBalance(weights)) {  //goal reached
            console.log("balanced: ", currNode);
            solutionPath = currNode.path();
            var lastElement = solutionPath[solutionPath.length - 1];

            //time to move back to home
            var end = Math.abs(8 - lastElement.newRow) + Math.abs(0 - lastElement.newColumn);
            solutionPath.push({
                type:"move",
                name: "crane",
                oldRow: lastElement.newRow,
                oldColumn: lastElement.newColumn,
                newRow: 8,
                newColumn: 0,
                time: end,
                cost: 0, //removing 
            })
            
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

                    //determine if crane is starting or not
                    var craneTime = 0;
                    var craneMove = null;

                    if (currNode.cost === 0){ //when crane should start at initial position 
                        //since from top, just manhattan distance
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
                        //oly compute crane if mm.name != cm Move name! (container changes)
                        if ( !cm || cm.name !== mm.name && (mm.newRow !== i.oldRow || mm.newColumn !== i.oldColumn)) {
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


                    //deprioritizing craneTime, since initialCrane time has too much influence on the problem path
                    var newCost = currNode.cost + 0.5*i.cost+  0.001*craneTime; 
                    var child = new Node(newP, currNode, i, newCost, craneMove);
                    var h = heuristic(newP);

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




// Return requirements:
// List of operations the user should perform in order (each operation should have an estimated execution time in minutes)
// Data format:
// [{type, name, time, oldRow, oldColumn, newRow, newColumn}, ...]
// [...
// {type: "move", name: "Ram", time: 4, oldRow: 1, oldColumn: 4, newRow: 1, newColumn: 8},
// {type: "move", name: "Cat", time: 1, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 4},
// {type: "move", name: "Dog", time: 2, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 5},
// ....]