import {priorityQueue, priortyQueue} from './priority.js'
import {Problem, Node, processData, hashGrid} from './problem.js'

// logic for handling the A* search algo smth
// logic for loading is similar to balancing, can use same heuristic, but without the balance constraint, general search is slightly tweaked as well
/*
Goal test: we have two options, goal state where we measure time or goal state we know we reached if it we completed all the operations
so i believe this goal test will need to be when we run out of operations, then we know we are done, we queue the operations based on costs gn and hn
*/
function goalTest(state) {
    return 
}

// queuing function or expand node function, find next state with operations 
function expandNode(state) {
}

//heuristic manhanttan might be able to use balance heuristic function
function heuristic(state) {
    return 
}
//f(n) = g(n) + h(n);
//g(n) -> current time
//h(n) -> estimated cost of time to reach goal 
//cost is based off of the time
export default function handleLoading(manifestText, operations) {
    let frontier = new priorityQueue();
    const visited = new Map();
    const solutionPath = [];

    // Note: right now, all this does is return the list of operations without any changes
    // This function will handle loading/unloading the containers. 
    // The data format of argument: manifestText <string>:
    // [row, col], {weight}, item
    // ...
    // [01, 02], {00000}, NAN
    // [01, 03], {00000}, NAN
    // [01, 04], {00120}, Ram
    // ....

    // Operations contain a list of onloading/offloading operations the user wants to perform
    // The data format of argument: operations
    // [{type, name}, {type, name}, ...]
    // [
    // ...
    // {type: "onload", name: "Dog"},
    // {type: "onload", name: "Cat"},
    // {type: "offload", name: "Beans"},
    // ...
    // ]
    
    // --------------------------------------------------
    // TODO: Implement ur search algorithm logic stuff here
    // ur code here (Remember to record ur screens!)
    let ship = processData(manifestText);
    let problem = new Problem(ship);
    let root = new Node(problem, null, null, 0);
    frontier.enqueue(root, 0);

    while(!frontier.isEmpty()){
        let curr = frontier.dequeue();
        let cost = curr.getCost();
        if(goalTest(curr.state)){
            solutionPath = curr.path();
            break;
        }
        visited.set(curr, cost)
        expandNode(curr, frontier, visited);

    }   
    // --------------------------------------------------

    // Return requirements:
    // List of operations the user should perform in order (each operation should have an estimated execution time in minutes)
    // Data format:
    // [{type, name, time, oldRow, oldColumn, newRow, newColumn}, ...]
    // [... 
    // {type: "move", name: "Beans", time: 1, oldRow: 1, oldColumn: 4, newRow: 1, newColumn: 5},
    // {type: "offload", name: "Beans", time: 12, oldRow: 1, oldColumn: 5, newRow: 0, newColumn: 0}, // Offload: Set newRow/newColumn to 0
    // {type: "onload", name: "Dog", time: 4, oldRow: 0, oldColumn: 0, newRow: 1, newColumn: 8}, // Onload: set oldRow/oldColumn to 0
    // ....]
    return solutionPath.map((move)=> ({
        ...move,
        oldRow: move.oldRow + 1,
        oldColumn: move.oldColumn + 1,
        newRow: move.newRow + 1,
        newColumn: move.newColumn + 1,
    }));
}