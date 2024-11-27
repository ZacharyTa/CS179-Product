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
//Not |weights| <=2, should be within 10% of each other!
function checkBalance(weights) {

    const maxWeight = Math.max(weights.left_weight, weights.right_weight);
    const weightDifference = Math.abs(weights.left_weight - weights.right_weight);

    if(weightDifference <= 0.1 * maxWeight){ return true; }
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

    return -1;
}




//simply returns valid moves for 1 container
function validateMoves(grid, row, col){ //coordinate of container
    
    var moves = []; //store starting and ending locations

    for(var j = 0; j < grid[0].length; j++){     
        for(var i =0; i < grid.length; i++){
            if(grid[i][j].name === "UNUSED" && j !== col){

                var c = Math.abs(row-i) + Math.abs(col-j);
                //need actual time taking into account obstacles
                var t = findTime(grid, row, col, i , j);
                
                moves.push({
                    type: "move",
                    name: grid[row][col].name,
                    oldRow: row ,
                    oldColumn: col,
                    newRow: i ,
                    newColumn:j,
                    cost: c,
                    time: t,
                });
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
            const container = grid[i][j];
            if(container && grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED" ){
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

    var weights = calc_weights(problem.grid);
    //how unbalanced problem is rn
    const weightDif = Math.abs(weights.left_weight - weights.right_weight); 

    var moves = getMoves(problem.grid); 
    var score = Number.MAX_SAFE_INTEGER;  

    for (const move of moves) {
        for (const m of move.moves) {

            var currCost = Math.abs(m.oldRow - m.newRow) + Math.abs(m.oldColumn - m.newColumn); 

            //take into account the grids that will have less imbalance than to
            //just simply account for the shortest "movement"
            var totalCost = currCost + weightDif; 

            score = Math.min(score, totalCost); 
        }
    }

    return score;
}


//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 

export default function handleBalancing(manifestText) { //A* search

    var frontier = new priorityQueue();         //frontier for A*
    var visited = new Map();                    //keep track of visited nodes
    var solutionPath = [];

    var buffer = Array.from({length: 4}, ()=> new Array(24).fill("UNUSED")); //buffer space


    var ship = processData(manifestText); // ship grid; returns an 8x12 grid
    var p = new Problem(ship); 
    var root = new Node(p, null, null, 0); 
    frontier.enqueue(root, 0);


    while(!frontier.isEmpty()){

        var currNode = frontier.dequeue(); 
        var weights = calc_weights(currNode.problem.grid);

        // console.log("Exploring node with cost: ", currNode.cost);
        // console.log("Grid state: ", currNode.problem.grid);
        // console.log("frontier size")

        if (checkBalance(weights)) {  //goal reached
            solutionPath = currNode.path();
            // solutionPath = setTimeForSolutionPath(currNode.problem.grid, solutionPath);
            break;  
        }
        
        var gridHash = hashGrid(currNode.problem.grid);
        //var gridSerial = serialize(currNode.problem.grid);
        // if(!visited.has(gridSerial)){
        if(!visited.has(gridHash)){
            // visited.add(gridSerial);
            visited.set(gridHash, currNode.cost); 

            //get possible moves
            var moves = getMoves(currNode.problem.grid)

            for(var m of moves){
                for( var i of m.moves){

                    var newGrid = currNode.problem.getNewGrid(currNode.problem.grid, i);
                    var newP = new Problem(newGrid)
                    var newCost = currNode.cost + i.cost;
                    var child = new Node(newP, currNode, i, newCost);

                    frontier.enqueue(child, newCost + heuristic(newP)); //currNode.cost is g(n)

                }
            }
        }
    }

    console.log("out of while loop")




    if(solutionPath === null){
        //process results ---> add type: move && shift results (no 0 indexing)
        console.error("No solution found. Will use SIFT");
        return [] //delete later

        //call shift from here

    }
    else{
        return solutionPath.map(({cost, ...move})=> ({
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