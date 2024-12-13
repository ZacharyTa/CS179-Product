// logic for handling the A* search algo smth
// import { Problem, Node, processData, hashGrid} from './problem.js'
import {Problem, Node, processData, hashGrid} from './problem.js'
import {priorityQueue} from './priority.js'
import {operateSift} from './Sift.js'
import {findTime, calculate_cranetime} from './balanceHelpers.js'


/**
 * costs:
 *  within buffer and ship: 1 min per cell
 * transfer betw them: 4
 * bufferzone: reflect over x axis, EX: most right bottom corner" (1,-1)
 */


//global var
var enable = false;


export function getMoves(state){
    var grid = state.grid;
    var buffer = state.buffer;
    var allMoves = [];

    //iterate through grid, validate any crates.
    for(var i = 0; i < grid.length; i++){
        for(var j = 0; j < grid[i].length; j++){
            const container = grid[i][j];
            if(container && grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED" ){
                var no_containerTop = i === grid.length - 1 || grid[i+1][j].name === "UNUSED";

                if(no_containerTop){
                    allMoves.push({ moves: validateMoves(state, "grid", i, j)} )
                }
            }
        }
    }

    //iterate thru buffer
    for (var i = 0; i < buffer.length; i++){
        for (var j=0; j< buffer[i].length; j++){
            const container = buffer[i][j];
            if (container && buffer[i][j].name !== "NAN" && buffer[i][j].name !=="UNUSED"){
                const no_containerTop = i === buffer.length - 1 || buffer[i+1][j].name === "UNUSED";

                if(no_containerTop){
                    allMoves.push({ moves: validateMoves(state, "buffer", i, j)} )
                }
            }
        }
    }
    return allMoves

}

function validateMoves(state, source, row, col) { 
    //console.log(state, source, row, col);
    var moves = []; 
    var number_of_moves = 0;
    var grid = state.grid;
    var buffer = state.buffer;
    var grid_type = "buffer";
    state[source][row][col]
    //console.log("state: ", state);
    
    for (var j = 0; j < grid[0].length; j++) {
        if (source == "grid" && j === col) continue; 
        
        // Find the "lowest" available position 
        let targetRow = findAvailableColumnSlot(grid, j);
        
        // If a valid row 
        if (targetRow !== -1) {
            number_of_moves +=1;

            var c = Math.abs(row - targetRow) + Math.abs(col - j); // Manhattan distance
            var t = -1;
            if (source == "grid"){
                t = findTime(grid, row, col, targetRow, j); // Find time with obstacles
                grid_type = "move";
            }
            else if (source == "buffer"){
                let source_to_pink = findTime(buffer, row, col, 4, 0);
                let pink_to_target = findTime(grid, 8, 0, targetRow, j)
                t = source_to_pink + 4 + pink_to_target;
                grid_type = "buffer";
            }

            moves.push({
                type: grid_type,
                newGrid: "grid",
                oldGrid: source,
                name: state[source][row][col].name,
                weight: state[source][row][col].w,
                oldRow: row,
                oldColumn: col,
                newRow: targetRow,
                newColumn: j,
                cost: t,
                time: t,
            });
        }
       
    }
    //if couldnt find enough unused slots in grid, find moves in buffer.
    if (number_of_moves <= 4){ //4 is just the cap. can be lower, higher, adjust later
        //for each column
        for (var i = 0; i < 4+number_of_moves; i++){
            if (source == "buffer" && i===col) continue;
            //find lowest available cell per column
            let targetRow = findAvailableColumnSlot(buffer, i);
            if (targetRow != -1){
 //calculate time to get to this slot

                //var c = Math.abs(row - targetRow) + Math.abs(col - j); // Manhattan distance
                var t = -1;

                if (source == "buffer")
                    t = findTime(buffer, row, col, targetRow, i); // Find time with obstacles
                    grid_type = "buffer";
                    
                if (source == "grid"){
                    let source_to_pink = findTime(grid, row, col, 8, 0);
                    let pink_to_target = findTime(buffer, 4, 0, targetRow, i)
                    t = source_to_pink + 4 + pink_to_target;
                    grid_type = "buffer";
                }

                moves.push({
                    type: "buffer",
                    newGrid: "buffer",
                    oldGrid: source,
                    name: state[source][row][col].name,
                    weight: state[source][row][col].w,
                    oldRow: row,
                    oldColumn: col,
                    newRow: targetRow,
                    newColumn: i,
                    cost: t,
                    time: t,
                });
            
            }
        }
    }
    return moves;
}

function findAvailableColumnSlot(grid, col){
    for (var i = 0; i < grid.length; i++) {
        if (grid[i][col].name === "UNUSED") {
            if (i === 0 || grid[i - 1][col].name !== "UNUSED") {
                return i;
            }
        }
    }
    return -1;
}


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

            if (currNode.cost > optimal_cost){
                continue;
            }

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
        var lastElement = {"newRow":8, "newColumn":0};
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