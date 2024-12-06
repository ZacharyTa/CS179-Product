import {Problem, Node, processData, hashGrid} from './problem.js'
import {priorityQueue} from './priority.js'
import {getMoves, findTime} from './handleBalancing.js'

//sorts all cargo in the ship
//returns a sorted list of containers
export function sortCrates(crates){
    return crates.sort((a, b) => b.w - a.w);
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
            //console.log(grid[i][j]);
            //console.log(target[i][j]);
            if (grid[i][j].w!= target[i][j].w){ //only weight matters, name doesnt.
                //console.log("wrong");
                //console.log(grid[i][j]);
                //console.log(target[i][j]);
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


    var p = new Problem(ship); //problem state
    var root = new Node(p, null, null, 0, null);
    frontier.enqueue(root, 0);
    console.log("root: ", root);
    let counter = 0;
    while (!frontier.isEmpty()){
        counter+=1;
        var current = frontier.dequeue();

        //console.log("current: ", current.problem.grid);


        if (isSifted(current.problem.grid, target)){
            console.log("SIFTED: ", current);

            solutionPath = current.path();

            var lastElement = {"newRow":9, "newColumn":1};
            if (solutionPath.length >0){ //if not empty
                lastElement = solutionPath[solutionPath.length - 1];
                console.log("solution path 1 : ", lastElement);
            }
            
            console.log("sol 0: ", lastElement);


            console.log("path: ", solutionPath);

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
        //now i need to hash the grid into a key and add it to the visited map.
        var gridHash = hashGrid(current.problem.grid);

        if (!visited.has(gridHash) || visited.get(gridHash) > current.cost){
            visited.set(gridHash, current.cost);

            //now i must get all possible moves, and begin astar tree building.
            var all_possible_moves_from_current_state =  getMoves(current.problem.grid);
            //cost : time it takes to move, 
            //heuristic : something to do with manhattan distance i think? 
            //like...idk ill add heuristic at the end
           
            for (var single_container_all_moves of all_possible_moves_from_current_state){
                for (var move of single_container_all_moves.moves){
                    
                    var newGrid = current.problem.getNewGrid(current.problem.grid, move);
                    var newProblem = new Problem(newGrid);

                    var craneTime = 0;
                    var craneMove = null;

                    //INIT POSITION
                    if (current.cost === 0){ //when crane should start at initial position 
                        //since from top, just manhattan distance
                        craneTime = Math.abs(8 - move.oldRow) + Math.abs(0 - move.oldColumn);
                        craneMove = {
                            type: "move",
                            name: "crane",
                            oldRow: 8, //will print 9 instead
                            oldColumn: 0, 
                            newRow: move.oldRow, 
                            newColumn: move.oldColumn,
                            time: craneTime
                        };
                    } 
                    else{ //Creates a crane movement instruction inbetween crate instructions

                        //maybe this needs adjusting? double check if this is right, i dont understand why cost would change this so hard.
                        var mm = current.getMove();
                        var cm = current.getCraneMove();
                        //oly compute crane if mm.name != cm Move name! (container changes)
                        if ( !cm || cm.name !== mm.name && (mm.newRow !== move.oldRow || mm.newColumn !== move.oldColumn)) {
                            craneTime =  findTime(newGrid, mm.newRow, mm.newColumn, move.oldRow, move.oldColumn);
                            craneMove = {
                                type: "move",
                                name: "crane",
                                oldRow: mm.newRow, 
                                oldColumn: mm.newColumn, 
                                newRow: move.oldRow, 
                                newColumn: move.oldColumn,
                                time: craneTime
                            };
                        } 
                    }

                    var newCost = current.cost + move.cost + craneTime;
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


//for balancing, new_cost = cost_thus_far + cost to get here
//prio = new_cost + heuristic

//what the hell is the heuristic
//all operators : every single posible move for every state
    //then, grab the most optimal time? this would suck though


    //astar

    //get all possible moves. add to PQ if not visited or better cost. with PQ its pretty good. ok.