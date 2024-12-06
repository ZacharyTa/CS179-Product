// logic for handling the A* search algo smth
import {Problem, Node, processData, hashGrid} from './problem.js'
import {priorityQueue} from './priority.js'

/**
 * costs:
 *  within buffer and ship: 1 min per cell
 * transfer betw them: 4
 * bufferzone: reflect over x axis, EX: most right bottom corner" (1,-1)
 */


//global var
//if enable = true, check buffer locations
var enable = false;


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


//find time between 2 points, with takng obstacles into mind
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
function validateMoves(grid, container) { 
    var moves = []; 
    var row = container.row;
    var col = container.col;


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



//moves from containers that are transfering from the ship to the buffer zone
//oldRow and oldColumn constant: always start (4,0)
function movesToBuffer(currNode, container, incurredTime){ 
    var buffer = currNode.problem.buffer;
    
    for(var i = 0; i < buffer.length; i++){
         // Find the "lowest" available position of buffer
        let targetRow = -1; 
        for (var j = 0; j < buffer.length; j++) {
            if (buffer[i][j].name === "UNUSED") {
                if (i === 0 || buffer[i - 1][j].name !== "UNUSED") {
                    targetRow = i; 
                    break;
                }
            }
        }

        if (targetRow !== -1){
            //cost and time same since only manhattan distance
            var t = Math.abs(4 - targetRow) + Math.abs(0 - j);

            buffer.push({
                type: "move",
                name: container.name,
                oldRow: 4, //5 after solutionPath processing
                oldColumn: -2, // -2 + 1 = -1 after solutionPath processing
                newRow: targetRow,
                newColumn: j,
                cost: t,
                time: t,
            });
        }        
    }

    return buffer;

}


//called if there are containers inside buffer zone
//i, j is container currently inside buffergrid
//generates moves within buffer && to each spot in grid going to (9,1) from wherever
function movesFromBuffer(currNode, i, j){
    var allMoves = [];
    var buffer  = currNode.problem.buffer;
    var grid = currNode.problem.grid;

    //moves within the buffer only
    allMoves = validateMoves(buffer,i, j );

    //moves to grid
    for (var i = 0; i < buffer.length; i++){
        for(var j = 0; j < buffer[i].length; i++){
            if (buffer[i][j] !== "UNUSED"){
                //time it takes to get to pink cell and crossing to grid
                var t = Math.abs(i - 4) + Math.abs(j - 0) + 4; 
                allMoves.push({ moves: manhatGrid(grid, buffer[i][j], t)} )
            }
        }
    }
    return moves;
}

//helpder function for MovesFrom buffer
function manhatGrid(grid, container, timeIncurred){
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
            var t = Math.abs(8 - targetRow) + Math.abs(0 - j) + timeIncurred; 
            moves.push({
                type: "move",
                name: grid[row][col].name,
                oldRow: 8,
                oldColumn: 0,
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
//since adding buffers, will be easier to just return the actual new statea instead of moves
function getMoves(currNode){ 

    var grid = currNode.problem.grid;
    var buffer = currNode.problem.buffer;
    var allMoves = [];
 
        //for all moves starting in the grid
        for(var i = 0; i < grid.length; i++){
            for(var j = 0; j < grid[i].length; j++){
                const container = {value: grid[i][j],row: i, col: j};
                if(container && grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED" ){
                    var no_containerTop = i === grid.length - 1 || grid[i+1][j].name === "UNUSED";

                    if(no_containerTop){
                        allMoves.push({ moves: validateMoves(grid, container)} )

                    }
                }
            }
        }

    return allMoves

}



function getMoveswithBuffer(currNode){ 

    var grid = currNode.problem.grid;
    var buffer = currNode.problem.buffer;
    var allMoves = [];
 
        //for all moves starting in the grid
        for(var i = 0; i < grid.length; i++){
            for(var j = 0; j < grid[i].length; j++){
                const container = {value: grid[i][j],row: i, col: j};
                if(container && grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED" ){
                    var no_containerTop = i === grid.length - 1 || grid[i+1][j].name === "UNUSED";

                    if(no_containerTop){
                        allMoves.push({ moves: validateMoves(grid, container)} )

                        //generate moves for buffer if enabled (going from grid to buffer)
                        if(enable === true){
                            //time to go from (i,j) to top (9,1) cell + 4 minutes to transfer
                            var toPinkCell = Math.abs(8 - i) + Math.abs(0 - j) + 4;
                            allMoves.push({ moves: movesToBuffer(currNode, container, toPinkCell)} )
                        }
                    }
                }
            }
        }

        //IF ENABLE === TRUE
        //get moves from inside buffer to grid (meaning moves within buffer if need and to grid)
        if (enable === true){
            for(var i = 0; i < buffer.length; i++){
                for (var j = 0; j < buffer[i].length; j++){
                    if(buffer[i][j] !== "UNUSED"){
                        allMoves.push({ moves: movesFromBuffer(currNode, i, j)} )
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
function heuristic(child) { //node

    var moves = getMoves(child);
    var minCost = Number.MAX_SAFE_INTEGER;

    var problem = child.problem;

    // Explore all moves
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


    //inside solvable determine if buffer space should be considered
    //if about half of the location of the ship grid is full, enable
    if(weights.length > 50 ){
        enable = true;
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

function SIFT (ship){ //for the sake of testing that it returns []
    return [];
}


//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 
export default function handleBalancing(manifestText) { 

    /**
     * on the chance that buffer space is enable
     */
    var buffer = Array.from({length: 4}, ()=> new Array(24).fill("UNUSED")); 


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
    //inside solvability determines if buffer space should also be enabled 
    var solvability = isSolvable(ship);
    if (!solvability){
        solutionPath = SIFT(ship);
        return solutionPath;
    }
    console.log("buffer enable status: ", enable);


    var p = new Problem(ship, buffer); 
    var root = new Node(p, null, null, 0, null, null); //removed craneMove. will ad its time to each container
    frontier.enqueue(root, 0);
    console.log("initial buffer: ", root.problem.buffer)


    while(!frontier.isEmpty()){

        var currNode = frontier.dequeue(); 
        var weights = calc_weights(currNode.problem.grid);
        console.log("expanded node: ", currNode)
        console.log("current node's buffer: ", currNode.problem.buffer);
        console.log("checkbalance: ", checkBalance(weights));
        console.log("buffer is empty: ",currNode.problem.bufferEmpty() )

        if (checkBalance(weights) && currNode.problem.bufferEmpty()) {  //goal reached
            console.log("checking for stopping condition");
            solutionPath = currNode.path();
            var lastElement = solutionPath[solutionPath.length - 1];

            //time to move back to home
            var end = Math.abs(8 - lastElement.newRow) + Math.abs(0 - lastElement.newColumn);
            console.log("end: ", end)
            lastElement.time += end;
            break;  
        }
        
        var gridHash = hashGrid(currNode.problem.grid);
        if(!visited.has(gridHash) || visited.get(gridHash) > currNode.cost){
            visited.set(gridHash, currNode.cost); 

            //get possible moves
            var moves = getMoves(currNode) //if enabled, should have buffer moves
            console.log("moves for expanded node: ", moves)


            //instead of each moves
            //for each states per container m
            for(var m of moves){
                for( var i of m.moves){

                    //if enabled, needs to moves for the needed grid or buffer!
                    var newGrid = currNode.problem.getNewGrid(currNode.problem.grid, i);
                    //if not enabled, just keep passing the empty one carried througout
                    var newBuffer = currNode.problem.buffer;
                    if (enable === true){newBuffer = currNode.problem.getNewGrid(currNode.problem.buffer, i);}
                    var newP = new Problem(newGrid, newBuffer);

                    //determine if crane is starting or not
                    var craneTime = 0;
                    var craneMove = null;
                    var bufferMove = null; //will pass null only if enable != true

                    if (currNode.cost === 0){ //when crane should start at initial position 
                        //since from top, just manhattan distance

                        //add this time to each beginning moves
                        craneTime = Math.abs(8 - i.oldRow) + Math.abs(0 - i.oldColumn);
                        //i.time += craneTime;

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

                            // var p = currNode.parent.getMove();
                            // //console.log("p.time: ", p.time)

                            // if(p !== null){
                            //     console.log("p.time: ", p.time)
                            //     mm.time += p.time;// + craneTime;
                            // }
                            
                        } 
                    }

                    if (enable === true){
                            //need to set and pass bufferMove
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








//testing new version ----> if works, changing A* while loop


// function getMoves(currNode){ 

//     var grid = currNode.problem.grid;
//     var buffer = currNode.problem.buffer;
//     var allMoves = [];
 
//         //for all moves starting in the grid
//         for(var i = 0; i < grid.length; i++){
//             for(var j = 0; j < grid[i].length; j++){
//                 const container = {value: grid[i][j],row: i, col: j};
//                 if(container && grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED" ){
//                     var no_containerTop = i === grid.length - 1 || grid[i+1][j].name === "UNUSED";

//                     if(no_containerTop){
//                         allMoves.push({ moves: validateMoves(grid, container)} )

//                     }
//                 }
//             }
//         }

//     return allMoves

// }

// //returns all states from currNode
// function getStates(currNode){
//     var grid = currNode.problem.grid;
//     var buffer = currNode.problem.grid;

//     var states = [];

//     //when enable is false




// }


// function validateMoves(grid, container) { 
//     var moves = []; 
//     var row = container.row;
//     var col = container.col;


//     for (var j = 0; j < grid[0].length; j++) {
//         if (j === col) continue; 

//         // Find the "lowest" available position 
//         let targetRow = -1; 
//         for (var i = 0; i < grid.length; i++) {
//             if (grid[i][j].name === "UNUSED") {
//                 if (i === 0 || grid[i - 1][j].name !== "UNUSED") {
//                     targetRow = i; 
//                     break;
//                 }
//             }
//         }

//         // If a valid row 
//         if (targetRow !== -1) {
//             var c = Math.abs(row - targetRow) + Math.abs(col - j); // Manhattan distance
//             var t = findTime(grid, row, col, targetRow, j); // Find time with obstacles

//             moves.push({
//                 type: "move",
//                 name: grid[row][col].name,
//                 oldRow: row,
//                 oldColumn: col,
//                 newRow: targetRow,
//                 newColumn: j,
//                 cost: c,
//                 time: t,
//             });
//         }

//     }

//     return moves;
// }







// export default function handleBalancing(manifestText) { 

//     var buffer = Array.from({length: 4}, ()=> new Array(24).fill("UNUSED")); 
//     var frontier = new priorityQueue();   //frontier for A*
//     var visited = new Map();              //keep track of visited nodes
//     var solutionPath = [];

//     // ship grid; returns an 8x12 grid
//     var ship = processData(manifestText); 

//     //if grid is empty or grid is already balanced, return empty solutionPath
//     var pre_check_w= calc_weights(ship);
//     var containers = getAllWeights(ship);
//     if (containers.length == 0 || checkBalance(pre_check_w)){ return [];}

//     //check for solvability, if not, call SIFT
//     //inside solvability determines if buffer space should also be enabled 
//     var solvability = isSolvable(ship);
//     if (!solvability){
//         solutionPath = SIFT(ship);
//         return solutionPath;
//     }
//     console.log("buffer enable status: ", enable);


//     var p = new Problem(ship, buffer); 
//     var root = new Node(p, null, null, 0, null, null);
//     frontier.enqueue(root, 0);
//     console.log("initial buffer: ", root.problem.buffer)


//     while(!frontier.isEmpty()){

//         var currNode = frontier.dequeue(); 
//         var weights = calc_weights(currNode.problem.grid);
//         console.log("expanded node: ", currNode)
//         console.log("current node's buffer: ", currNode.problem.buffer);
//         console.log("checkbalance: ", checkBalance(weights));
//         console.log("buffer is empty: ",currNode.problem.bufferEmpty() )

//         if (checkBalance(weights) && currNode.problem.bufferEmpty()) {  //goal reached
//             console.log("checking for stopping condition");
//             solutionPath = currNode.path();
//             var lastElement = solutionPath[solutionPath.length - 1];

//             //time to move back to home
//             var end = Math.abs(8 - lastElement.newRow) + Math.abs(0 - lastElement.newColumn);
//             solutionPath.push({
//                 type:"move",
//                 name: "crane",
//                 oldRow: lastElement.newRow,
//                 oldColumn: lastElement.newColumn,
//                 newRow: 8,
//                 newColumn: 0,
//                 time: end,
//                 cost: 0, //removing 
//             })
//             break;  
//         }
        
//         var gridHash = hashGrid(currNode.problem.grid);
//         if(!visited.has(gridHash) || visited.get(gridHash) > currNode.cost){
//             visited.set(gridHash, currNode.cost); 

//             //get possible states
//             var states = getStates(currNode);

//             //for each states per container m
//             for(var s of states){

//                 var craneMove = null;
//                 if (currNode.cost === 0){ //when crane should start at initial position 
//                     craneTime = Math.abs(8 - i.oldRow) + Math.abs(0 - i.oldColumn);
//                     craneMove = { type: "move",name: "crane", oldRow: 8, oldColumn: 0, newRow: i.oldRow, newColumn: i.oldColumn,time: craneTime};
//                 } 
//                 else{ //time from prev container to new container
//                     var mm = currNode.getMove();
//                     var cm = currNode.getCraneMove();
//                     //only compute crane if mm.name != cm Move name! (container changes)
//                     if ( !cm || cm.name !== mm.name && (mm.newRow !== i.oldRow || mm.newColumn !== i.oldColumn)) {
//                         craneTime =  findTime(newGrid, mm.newRow, mm.newColumn, i.oldRow, i.oldColumn);
//                         craneMove = {type: "move", name: "crane", oldRow: mm.newRow, oldColumn: mm.newColumn, 
//                                      newRow: i.oldRow, newColumn: i.oldColumn,time: craneTime}
//                     } 
//                 }


//                 //change later RIP
//                 var newP = s.problem;
//                 var move = s.move;
//                 var newCost = s.cost; //need to think about this one

//                 var bufferMove = s.bufferMove
//                 var child = new Node(newP, currNode, move, newCost, craneMove, bufferMove);
//                 var h = heuristic(child);

//                 var frontierPriority = h + newCost;
//                 frontier.enqueue(child, frontierPriority); //currNode.cost is g(n)
//             }
            
//         }
//     }

//     if(solutionPath === null){
//         console.error("No solution found. Will use SIFT");
//         return [] ;
//     }
//     else{
//         return solutionPath.map(({ cost, ...move }) => ({
//             ...move,
//             oldRow: move.oldRow + 1, 
//             oldColumn: move.oldColumn + 1,
//             newRow: move.newRow + 1,
//             newColumn: move.newColumn + 1,
//         }));
//     }
// } //end handleBalancing




// Return requirements:
// List of operations the user should perform in order (each operation should have an estimated execution time in minutes)
// Data format:
// [{type, name, time, oldRow, oldColumn, newRow, newColumn}, ...]
// [...
// {type: "move", name: "Ram", time: 4, oldRow: 1, oldColumn: 4, newRow: 1, newColumn: 8},
// {type: "move", name: "Cat", time: 1, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 4},
// {type: "move", name: "Dog", time: 2, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 5},
// ....]