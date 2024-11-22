
//class to represent Problem states (tree structure)
class Problem{
    
    constructor(ship,buffer, time){         //current state
        this.grid = ship;
        this.buffer = buffer; 
        this.time = time;
    }

    setTime(time) { this.time = time;}
    getGrid(){return this.grid;}
    getTime(){return this.time;}

    //after getting the optimal move (based on time), changes location of the container to the wanted location
    setGrid(newX, newY, name){
        //something like:
        /**
         * at ship[newx][newy] = name (one container at a time)
         */
    }

    setBuffer(nex, newY, name){}

    bufferEmpty(){}; //returns true if nothing is in the buffer
}


//Node structure 
// class Node{
//     constructor(state, parent = null, solution, time){
//         this.state = state;
//         this.parent = parent;
//         this.solution = solution;
//         this.time = time;
//     }



// }





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

        //contents needs to flip when stored in to grid
        // var flip = 7 - row;
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


export {Problem, Node, processData}

