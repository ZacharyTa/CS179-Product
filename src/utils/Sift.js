import {Problem, Node, processData, hashGrid} from './problem.js'
import {priorityQueue} from './priority.js'
import {findTime} from './handleBalancing.js'

//sorts all cargo in the ship
//returns a sorted list of containers
export function sortCrates(crates){
    return crates.sort((a, b) => b.w - a.w);
}

function getMoves(state){
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

function validateMoves(state, source, row, col) { 
    console.log(state, source, row, col);
    debugger;
   
    var moves = []; 
    var number_of_moves = 0;

    var grid = state.grid;
    var buffer = state.buffer;

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
            if (source == "grid")
                t = findTime(grid, row, col, targetRow, j); // Find time with obstacles
            if (source == "buffer"){
                let source_to_pink = findTime(buffer, row, col, 8, 0);
                let pink_to_target = findTime(grid, 8, 0, targetRow, j)
                t = source_to_pink + 4 + pink_to_target;
            }

            moves.push({
                type: "move",
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
    if (number_of_moves <= 8){ //8 is just the cap. can be lower, higher, adjust later
        //for each column
        for (var i = 0; i < 24; i++){
            if (source == "buffer" && i===col) continue;
            //find lowest available cell per column
            let targetRow = findAvailableColumnSlot(buffer, i);
            if (targetRow != -1){
 //calculate time to get to this slot

                //var c = Math.abs(row - targetRow) + Math.abs(col - j); // Manhattan distance
                var t = -1;

                if (source == "buffer")
                    t = findTime(grid, row, col, targetRow, j); // Find time with obstacles
                if (source == "grid"){
                    let source_to_pink = findTime(grid, row, col, 8, 0);
                    let pink_to_target = findTime(buffer, 8, 0, targetRow, j)
                    t = source_to_pink + 4 + pink_to_target;
                }

                moves.push({
                    type: "move",
                    newGrid: "buffer",
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
    }

    return moves;
}


//returns grid goal state
export function obtainGoalState(ship){
    //for crate in ship, add to array. then, sort by weight.
    const new_grid = Array.from({length: 8}, ()=> new Array(12).fill(null));
    let crates = []
    console.log("obtaining goal state: start");
    console.log(ship);
    for (let i = 0; i < ship.length; i++) {
        for (let j = 0; j < ship[i].length; j++) {
          const cell = ship[i][j];

          if (cell["name"]=="NAN"){
            console.log("NAN SPOT");
            new_grid[i][j] = JSON.parse(JSON.stringify(cell)); //this is convoluted but creates a deep copy. no worries.
          }
          else if (cell["name"]!="UNUSED"){
            crates.push(JSON.parse(JSON.stringify(cell)));
          }

        }
      }
      console.log("CRATES: ", crates);
   
      var sorted_crates = sortCrates(crates);
      console.log("SORTED: ", sorted_crates);

      for (let i = 0; i < new_grid.length; i++) {
        for (let j = 0; j < new_grid[i].length; j++) {
            const cell = new_grid[i][j];
            if (!cell){
                if (sorted_crates.length ===0){
                    new_grid[i][j] = {"w": 0, "name": "UNUSED"};
                }
                else{
                    new_grid[i][j] = sorted_crates.shift();
                }
            }

        }

      }
      console.log("GOAL : ", new_grid);
      return new_grid;
}


//d
export function isSifted(grid, target){
    for (let i =0; i< grid.length; i++){
        for (let j = 0; j< grid[i].length; j++){
            if (grid[i][j].w!= target[i][j].w){ //only weight matters, name doesnt.
                return false;
            }
        }
    }
    return true;
}

//a* tree creation
export function operateSift(ship){
    var frontier = new priorityQueue();
    var visited = new Map();
    var solutionPath = [];

    //obtain Goal state
    var target = obtainGoalState(ship);

    var buffer = []
    for (let i = 0; i < 4; i++){
        let row = [];
        for (let j = 0; j < 24; j++){
            let cell = {"w":0, "name":"UNUSED"};
            row.push(cell);
        }
        buffer.push(row);
    }
    
    var p = new Problem(ship, buffer); //problem state
    var root = new Node(p, null, null, 0, null);
    frontier.enqueue(root, 0);
    console.log("root: ", root);
    let counter = 0;
    while (!frontier.isEmpty()){
        counter+=1;
        var current = frontier.dequeue();
        console.log(current.move);

        if (counter >0){
            
            counter = 0;
            debugger;
        }
        

        if (isSifted(current.problem.grid, target)){
            console.log("SIFTED: ", current);

            solutionPath = current.path();

            var lastElement = {"newRow":9, "newColumn":1};
            if (solutionPath.length >0){ //if not empty
                lastElement = solutionPath[solutionPath.length - 1];
                console.log("solution path 1 : ", lastElement);
            }

            
            var end = Math.abs(8 - lastElement.newRow) + Math.abs(0 - lastElement.newColumn);

            //Adds this at the very end as a reminder to put the crane back in the right place.
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

        //now i need to hash the grid into a key and add it to the visited map.
        var gridHash = hashGrid(current.problem.grid);

        if (!visited.has(gridHash) || visited.get(gridHash) > current.cost){
            visited.set(gridHash, current.cost);
            
            

            //now i must get all possible moves, and begin astar tree building.
            
            var all_possible_moves_from_current_state =  getMoves(current.problem); //push buffer as well

            
           
            for (var single_container_all_moves of all_possible_moves_from_current_state){
                for (var move of single_container_all_moves.moves){
                    
                    //var newGrid = current.problem.getNewGrid(current.problem.grid, move);
                    //var newBuffer = current.problem.getNewGrid(current.problem.buffer, move);
                    var [newGrid, newBuffer] = current.problem.getNewGrids(current.problem.grid, current.problem.buffer, move);
                    //console.log("new grid: ", newGrid);
                    //console.log("new buffer: ", newBuffer);
                    var newProblem = new Problem(newGrid, newBuffer);

         
                    var craneMove = null;

                    //INIT POSITION


                    var newCost = current.cost + move.cost;
                    var child = new Node(newProblem, current, move, newCost, craneMove);

                    //put new heuristic here..
                    const h = heuristic(move, newProblem, target);

                    var priority = newCost+h;

                    frontier.enqueue(child, priority);
                }
            }
        }


        
    }

    return solutionPath.map((move)=>({
        ...move,
        oldRow: move.oldRow + 1,
        oldColumn: move.oldColumn+1,
        newRow: move.newRow+1,
        newColumn: move.newColumn+1

    }));

}

//two heuristic ideas
function heuristic(move, grid, goal){
    //compare the new container.
    //find move coordinates in goal.
    let min_distance = Infinity;
    for (let i = 0; i < goal.length; i++){
        for (let j =0; j< goal[i].length; j++){
            if (move.weight == goal[i][j].w){
                //get distance
                const distance = Math.abs(move.newColumn - j)+ Math.abs(move.newRow-i);
                min_distance = Math.min(distance ,min_distance)
            }
        }
    }

    return min_distance;

    

}

function heuristic_better(move, grid, goal){
    for (let i =0; i< goal.length; i++){
        
    }
}


//for balancing, new_cost = cost_thus_far + cost to get here
//prio = new_cost + heuristic

//what the hell is the heuristic
//all operators : every single posible move for every state
    //then, grab the most optimal time? this would suck though


    //astar

    //get all possible moves. add to PQ if not visited or better cost. with PQ its pretty good. ok.