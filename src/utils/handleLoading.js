// logic for handling the A* search algo smth

export default function handleLoading(manifestText, operations) {
  const optimalOperations = [
    {
      type: "move",
      name: "Ram",
      time: 3,
      oldRow: 1,
      oldColumn: 4,
      newRow: 4,
      newColumn: 1,
    },
    {
      type: "move",
      name: "Dog",
      time: 3,
      oldRow: 2,
      oldColumn: 2,
      newRow: 5,
      newColumn: 1,
    },
    {
      type: "offload",
      name: "Owl",
      time: 3,
      oldRow: 1,
      oldColumn: 9,
      newRow: 0,
      newColumn: 0,
    },
    {
      type: "onload",
      name: "Top",
      time: 3,
      oldRow: 0,
      oldColumn: 0,
      newRow: 6,
      newColumn: 1,
    },
    {
      type: "buffer",
      name: "Top",
      time: 3,
      oldRow: 6,
      oldColumn: 1,
      newRow: 1,
      newColumn: -1,
    },
    {
      type: "buffer",
      name: "Top",
      time: 3,
      oldRow: 1,
      oldColumn: -1,
      newRow: 1,
      newColumn: -24,
    },
    {
      type: "buffer",
      name: "Top",
      time: 3,
      oldRow: 1,
      oldColumn: -24,
      newRow: 6,
      newColumn: 1,
    },
  ];
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
  // [{type, name, time, oldRow, oldColumn, newRow, newColumn}, ...]
  // [...
  // {type: "move", name: "Beans", time: 1, oldRow: 1, oldColumn: 4, newRow: 1, newColumn: 5},
  // {type: "offload", name: "Beans", time: 12, oldRow: 1, oldColumn: 5, newRow: 0, newColumn: 0}, // Offload: Set newRow/newColumn to 0
  // {type: "onload", name: "Dog", time: 4, oldRow: 0, oldColumn: 0, newRow: 1, newColumn: 8}, // Onload: set oldRow/oldColumn to 0
  // ....]
  return optimalOperations;
}
