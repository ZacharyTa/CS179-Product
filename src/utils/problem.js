
//class to represent Problem states (tree structure)
class Problem{
    
    // constructor(ship, buffer){
    constructor(ship){        
        this.grid = ship;
        //this.buffer = buffer; //might remove this, not sure yet, if so will also delete setBuffer() & bufferEmpty()
        // this.time = time; this will be stored with Node instead
    }

    // setTime(time) { this.time = time;}
    getGrid(){return this.grid;}
    getTime(){return this.time;}

    //function to return a grid with a new move; 
    getNewGrid(grid, move){
        var newGrid = grid.map(row =>row.map(cell => ({...cell})));

        var container = newGrid[move.oldRow][move.oldColumn];
        newGrid[move.oldRow][move.oldColumn] = {name: "UNUSED", w: 0}; //old spot should now be unused
        newGrid[move.newRow][move.newColumn]= container;

        return (newGrid);

    }


    setBuffer(nex, newY, name){}
    bufferEmpty(){}; //returns true if nothing is in the buffer
}


//Node structure 
class Node{

    constructor(problem, parent, move, cost){
        this.problem = problem;         //the grid
        this.parent = parent; 
        this.move = move,
        this.cost = cost;
    }


    path(){
        const path = [];
        var currNode = this;
        while (currNode.parent != null){
            path.unshift(currNode.move) //adding to path
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


export {Problem, Node, processData, hashGrid}

