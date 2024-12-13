
export function findTime(input_grid, r, c, i ,j){
    let grid = input_grid.map(row => [...row]);
    let top_row = [];
    for (let i =0; i < input_grid[0].length; i++){
        top_row.push({"w":0, "name":"UNUSED"});
    }
    grid.push(top_row);
    
    //directions
    var dir = [ {row: 1, col: 0 },
                {row: -1, col: 0},
                {row: 0, col: -1},
                {row: 0, col: 1 }]

    var q = [{row: r, col: c, time: 0}];
    var seen = new Set();
    seen.add(`${r}-${c}`);

    while (q.length > 0){
        var {row, col, time} = q.shift();
        if(row === i && col ===j){return time;}
        
        for( var{row: dr, col: dc} of dir){
            var newR = row + dr;
            var newC = col + dc;
            // if with grid bounds
            if(newR >=0 && newR < grid.length && newC >= 0 && newC < grid[0].length){
                //if not visited and available to be moved to (so no nan or other containers)
                if (!seen.has(`${newR}-${newC}`) && grid[newR][newC].name === "UNUSED"){
                    seen.add(`${newR}-${newC}`);
                    q.push({row: newR, col: newC, time:time + 1});
                }
            }
        }
    }
    
    debugger;
    return 10000; //to deprioritize inside frontier priority and heuristic
}

export function calculate_cranetime(node, move){
    var mm = node.getMove();
    let craneTime = 0;

    if (!mm){ //when crane should start at initial position 
        craneTime = Math.abs(8 - move.oldRow) + Math.abs(0 - move.oldColumn);
    } 
    else{ 
        
        if (mm.newGrid == move.oldGrid){
            var crane_grid;
            if (mm.newGrid == "grid") crane_grid = node.problem.grid;
            else crane_grid = node.problem.buffer;


            var temp = JSON.parse(JSON.stringify(crane_grid[move.oldRow][move.oldColumn]));
            crane_grid[move.oldRow][move.oldColumn] = {"name":"UNUSED", "w":0};
            craneTime =  findTime(crane_grid, mm.newRow, mm.newColumn, move.oldRow, move.oldColumn);
        
            
            crane_grid[move.oldRow][move.oldColumn] = temp;
            
            
        }
        else if (mm.newGrid == "buffer" && move.oldGrid == "grid"){
            var temp = JSON.parse(JSON.stringify(node.problem.grid[move.oldRow][move.oldColumn]));
            node.problem.grid[move.oldRow][move.oldColumn] = {"name":"UNUSED", "w":0};

            let buffer_to_pink = findTime(node.problem.buffer, mm.newRow, mm.newColumn, 4, 0);
            let pink_to_grid = findTime(node.problem.grid, 8, 0, move.oldRow, move.oldColumn);

            node.problem.grid[move.oldRow][move.oldColumn] = temp;

            craneTime = buffer_to_pink + pink_to_grid + 4;
        }
        else if (mm.newGrid== "grid" && move.oldGrid == "buffer"){
            var temp = JSON.parse(JSON.stringify(node.problem.buffer[move.oldRow][move.oldColumn]));
            node.problem.buffer[move.oldRow][move.oldColumn] = {"name":"UNUSED", "w":0};

            let grid_to_pink = findTime(node.problem.grid, mm.newRow, mm.newColumn, 8, 0);
            let pink_to_buffer = findTime(node.problem.buffer, move.oldRow, move.oldColumn, 4, 0);

            node.problem.buffer[move.oldRow][move.oldColumn] = temp;
            craneTime = grid_to_pink + pink_to_buffer + 4;


        }

    }

    return craneTime;
}