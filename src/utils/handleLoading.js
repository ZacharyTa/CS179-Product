// logic for handling the A* search algo smth

export default function handleLoading(manifestText, operations) {
    const optimalOperations = operations;
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
    



    // --------------------------------------------------

    // Return requirements:
    // List of operations the user should perform in order (each operation should have an estimated execution time in minutes)
    // Data format:
    // [{type, name, time, row, column}, ...]
    // [... 
    // {type: "onload", name: "Dog", time: 12, row: 1, column: 12},
    // {type: "offload", name: "beans", time: 9, row: 0, column: 0}, // For offload operations, set row/column to 0
    // {type: "onload", name: "Cat", time: 19, row: 2, column: 12},
    // ....]
    return optimalOperations;
}