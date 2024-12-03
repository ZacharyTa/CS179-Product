import {Problem, Node, processData, hashGrid} from './problem.js'
import {priorityQueue} from './priority.js'


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
          //console.log(`Row: ${i}, Col: ${j}`);
          //console.log(`Cell: ${JSON.stringify(cell)}`);
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
export function isSifted(){

}

//a* tree creation
export function operateSift(ship){
    var frontier = new priorityQueue();
    var visited = new Map();
    var solutionPath = [];

    //obtain Goal state
    var target = obtainGoalState(ship);
    


    var p = new Problem(ship); //problem state
    var root = new Node(p, null, null, 0)
    frontier.enqueue(root, 0);

    while (!frontier.isEmpty()){

        var currNode = frontier.dequeue();
        


        
    }
}



//for balancing, new_cost = cost_thus_far + cost to get here
//prio = new_cost + heuristic

//what the hell is the heuristic
//all operators : every single posible move for every state
    //then, grab the most optimal time? this would suck though


    //astar

    //get all possible moves. add to PQ if not visited or better cost. with PQ its pretty good. ok.