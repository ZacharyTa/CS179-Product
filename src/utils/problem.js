//class to represent Problem states (tree structure)
class Problem{
    
    // constructor(ship, buffer){
    constructor(ship, bufferZone){        
        this.grid = ship;
        this.buffer = bufferZone; 
    }

    bufferEmpty(){
        return this.buffer.every(row => row.every(cell => cell === "UNUSED"))
    } 


    getGrid(){return this.grid;}
    getBugger(){return this.buffer}

    //function to return a grid with a new move; (used for either buffer or grid)
    getNewGrid(grid, move){
        var newGrid = grid.map(row =>row.map(cell => ({...cell})));

        var container = newGrid[move.oldRow][move.oldColumn];
        newGrid[move.oldRow][move.oldColumn] = {name: "UNUSED", w: 0}; //old spot should now be unused
        newGrid[move.newRow][move.newColumn]= container;

        return (newGrid);

    }

    //if crossing between buffer and grid (need to modify getNewGrid)

}





//Node structure 
class Node{

    constructor(problem, parent, move, cost, craneMove, bufferMove){
    // constructor(problem, parent, move, cost, bufferMove){
        this.problem = problem;         
        this.parent = parent; 
        this.move = move,
        this.cost = cost;
        this.craneMove = craneMove; //only if the containers are different
                                    //else pass [] (gets taken care of in path())
        this.bufferMove = bufferMove;
        
    }

    getCraneMove (){ return this.craneMove;}
    getMove(){return this.move; }
    getBufferMove(){return this.bufferMove}


    path() {
        const path = [];
        let currNode = this;
    
        //add container move
        while (currNode.parent != null) {
            if (currNode.move != null && !isNaN(currNode.move.newRow) && !isNaN(currNode.move.newColumn)) {
                path.unshift(currNode.move);
                //add crane time
                if (currNode.craneMove != null && !isNaN(currNode.craneMove.newRow) && !isNaN(currNode.craneMove.newColumn)) {
                    //path.unshift(currNode.craneMove);
                    currNode.move.time = (currNode.move.time || 0) + currNode.craneMove.time;
                }
            }


            //add buffer move
            if (currNode.bufferMove != null && !isNaN(currNode.bufferMove.newRow) && !isNaN(currNode.bufferMove.newColumn)) {
                path.unshift(currNode.craneMove);
            }

            currNode = currNode.parent;
        }
    
        return path;
    }
    

}



//need to make hasing for 2d object 
function hashGrid(grid) {
    let hash = '';
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let cell = grid[i][j];
            hash += `${i}-${j}-${cell.name}-${cell.w}|`;
        }
    }
    return stringToHash(hash);
}

function stringToHash(str) {
    var hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
    }
    return hash;
}



//Function to process the manifestText (this is a string)
function processData(manifestText){
    const grid = Array.from({length: 8}, ()=> new Array(12).fill(null));
    const loc = manifestText.split("\n").map(line=>line.trim()).filter(line => line.length > 0);

    loc.forEach(line =>{
        var info = line.split(",");                                
        var row = parseInt(info[0].substring(1,3), 10 )-1;
        var col = parseInt(info[1].substring(0,2), 10) - 1;
        var w = parseInt(info[2].trim().replace(/[^\d]/g ,""), 10);
        var name = info[3].trim();

        if (row >= 0 && row < 8 && col >= 0 && col < 12){
            grid[row][col] = {w, name}; //@ each grid, has weight and name
        }
    });
    
    return grid; 
}

//info[0] = [ x1 x2, 
//info[1] = y1 y2 ]
//info[1] = {xxxx}
//info[2] = "string"


// function giantMatrix(ship){
//     const grid = Array.from({length: 8}, ()=> new Array(36).fill(null));


//     //copy contents of ship into grid
//     for(var i = 0; i < ship.length; i++){
//         for(var j = 0; j < ship[i].length; j++){
//             grid[i][j] = ship[i][j];
//         }
//     }

//     //construct buffer zone
//     for(var i = 0; i < grid.length; i++){
//         for(var j = 8; j < grid[i].length; j++){
//             if (i < 4){
//                 grid[i][j] = "NAN"
//             }
//             else{
//                 grid[i][j] = "UNUSED"
//             }
//         }
//     }

//     return grid;

// }



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



export {Problem, Node, processData, hashGrid, isSolvable, getAllWeights}

