
//class to represent Problem states (tree structure)
class Problem{
    
    constructor(ship, time){         //current state
        this.grid = ship;
        // this.parent = parent; 
        this.time = time;

        //current coordinate -> using these inside validate moves
        // this.x = x;
        // this.y = y
        //this.movement = movement; //stores string "left" or "right" (for unloading/loading I think u can just set it arbitrarily to anything and pass)
    }

    setTime(time){
        this.time = time;
    }


    getGrid(){
        return this.grid;
    }

    getTime(){
        return this.time;
    }


    // validateMoves(grid){ //this one is implement for each operations instead
        
    // }


    //after getting the optimal move (based on time), changes location of the container to the wanted location
    setMove(newX, newY, name){
        //something like:
        /**
         * at ship[newx][newy] = name (one container at a time)
         */
    }


}


class Buffer{
    constructor(){
        this.grid = Array.from({length: 4}, ()=> new Array(24).fill(null)); //empty 4x24 grid
    }

    isEmpty(){}; //returns true if nothing is in the buffer
    containers(){}; //maybe return all containers that are in here

}



//Node structure 






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
        var flip = 7 - row;
        if (flip >= 0 && flip < 8 && col >= 0 && col < 12){
            grid[flip][col] = {w, name}; //@ each grid, has weight and name
        }
    });
    
    return grid; 
}

//info[0] = [ x1 x2, 
//info[1] = y1 y2 ]
//info[1] = {xxxx}
//info[2] = "string"


export {Problem, processData}

