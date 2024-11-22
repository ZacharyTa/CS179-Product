// logic for handling the A* search algo smth

import {Problem, processData} from './problem.js'
import {priorityQueue} from './priority.js'

/**
 * Need to:
 * 2) define possible moves
 * 3) compute manhattan dist h function
 * 5) return solution (based on optimal time)
 * 
 * 
 * costs:
 *  within buffer and ship: 1 min per cell
 * transfer betw them: 4
 */



//calculate weights, and return them
function calc_weights(ship){
    var left_weight = 0;
    var right_weight = 0;

    for (var i = 0; i < ship.length; i++){
        for(var j= 0; j < ship[i].length; j++){
            if (ship[i][j].name !== "NAN" && ship[i][j].name !== "UNUSED"){
                //compute left weights
                if (j < 6) left_weight += ship[i][j].w;
                else right_weight += ship[i][j].w;
            }
        }
    }
    return {left_weight, right_weight}
}

//check currrent weight sides of ship to goal weight
function checkBalance(weights){ 

    var isBalanced = false;
    if(Math.abs(weights.left_weight - weights.right_weight) <= 2){
        isBalanced = true;
    }

    return isBalanced;
}


// //calcs ManhattanDistance from (row, col) to (i, j)
// function calcDist(row, col, i, j, ship){

// }


//simply returns valid moves for 1 container
function validateMoves(grid, row, col){ //coordinate of container
    
    var moves = []; //store starting and ending locations

    for(var j = 0; j < grid[0].length; j++){      //start at container location
        for(var i = grid.length-1; i >= 0; i--){
            if(grid[i][j].name === "UNUSED" && j !== col){

                var t = Math.abs(row-i) + Math.abs(col-j);
                moves.push({
                    oldRow: row,
                    oldColumn: col,
                    newRow: i,
                    newColumn:j,
                    time: t,
                });
                break;
            }
        }
    }

    return moves;

}


function getMoves(ship){
    var allMoves = [];
    for(var i = 0; i < ship.length; i++){
        for(var j = 0; j < ship[i].length; j++){

            if(ship[i][j].name !== "NAN" && ship[i][j].name !== "UNUSED" ){
                var no_containerTop = i === 0 || ship[i-1][j].name === "UNUSED";
                if(no_containerTop){
                    allMoves.push({
                        moves: validateMoves(ship, i, j),
                        container_name: ship[i][j].name
                    })
                }
            }
        }
    }

    return allMoves

}

//heuristic  --> Manhattan
function manhattan_heuristic(problem){

}


export default function handleBalancing(manifestText) { //A* search
    const optimalOperations = [
        {name: "Ram", time: 4, oldRow: 1, oldColumn: 4, newRow: 1, newColumn: 8},
        {name: "Cat", time: 1, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 4},
        {name: "Dog", time: 2, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 5},
    ];


    //PRIORITY QUEUE (need to make since not in js) ---> frontier[]
    //visited (map to store visited)

    // Note: right now, all this does is return the list of random operations



    //process manifestText
    var ship = processData(manifestText); //returns an 8x12 grid 
    console.log(ship)

    var weights = calc_weights(ship); //199 , 0
    console.log(weights); 

    
    //test valid moves
    var allMoves = getMoves(ship);

    console.log("allMoves size: ", allMoves.length)
    console.log(allMoves.length);
    console.log(allMoves[0])
    console.log(allMoves[1])


    // var time = 0;

    // //set initial problem state---> root
    // var problem = new Problem(ship, time); 
    // var frontier = new priorityQueue();         //frontier for A*
    // var visited = new Map();                    //keep track of visited nodes

    // frontier.enqueue(problem, time);

    // while(!frontier.isEmpty()){
    //     //compute!
    //     break; //place holder for now
    // }

    




    // --------------------------------------------------

   // Return requirements:
    // List of operations the user should perform in order (each operation should have an estimated execution time in minutes)
    // Data format:
    // [{type, name, time, oldRow, oldColumn, newRow, newColumn}, ...]
    // [...
    // {type: "move", name: "Ram", time: 4, oldRow: 1, oldColumn: 4, newRow: 1, newColumn: 8},
    // {type: "move", name: "Cat", time: 1, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 4},
    // {type: "move", name: "Dog", time: 2, oldRow: 1, oldColumn: 4, newRow: 2, newColumn: 5},
    // ....]
    return optimalOperations;
}