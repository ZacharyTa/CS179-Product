//Priority queue for A* search 


/**
 * Prioritizes based on min time accrued
 * EX:
 * var frontier = new priorityQueue();
 * frontier.enqueue(Problem, time);
 * frontiner.dequeue();
 */
class priorityQueue{
    
    constructor(){this.values = [];}

    //add to prioirty queue
    enqueue(node, priority){ //priority == current time accrued 
        var flag = false;
        for(var i = 0; i < this.values.length; i++){
            if(this.values[i].priority > priority){
                this.values.splice(i, 0, {node, priority});
                flag = true;
                break;
            }
        }
        if(!flag){
            this.values.push({node, priority});
        }
    }

    //remove from priority queue
    dequeue(){
        return this.values.shift();
    }


    //returns head of the container
    front(){return this.values[0];}

    size(){return this.values.length;}
    

    isEmpty(){
        if(this.values.length == 0){
            return true;
        }
        else{
            return false;
        }
    }


}


export{priorityQueue}