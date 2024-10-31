"use client";
import { useState } from "react";

interface Container {
  item: string;
  location: { row: number; column: number };
  index?: number;
}

const dummy: Container[] = [
  {
    item: "One",
    location: { row: 0, column: 0 },
  },
  {
    item: "Two",
    location: { row: 0, column: 1 },
  },
  {
    item: "Three",
    location: { row: 0, column: 2 },
  },
  {
    item: "Four",
    location: { row: 1, column: 0 },
  },
  {
    item: "Five",
    location: { row: 1, column: 1 },
  },
  {
    item: "Six",
    location: { row: 1, column: 2 },
  },
  {
    item: "Seven",
    location: { row: 2, column: 0 },
  },
  {
    item: "Eight",
    location: { row: 2, column: 1 },
  },
  {
    item: "Nine",
    location: { row: 2, column: 2 },
  },
];

interface ShipGridProps {
  containers: Container[];
}

export default function ShipGrid({ containers = dummy }: ShipGridProps) {
  const [gridContainers, setGridContainers] = useState<Container[]>();

  const updateGrid = () => {
    cordsToIndex(containers);
    console.log(gridContainers);
  };

  const cordsToIndex = (containerss: Container[]) => {
    const newContainers: Container[] = [];
    for (let i = 0; i < containers.length; i++) {
      const newContainer = containerss.at(i);
      if (newContainer) {
        newContainer.index =
          newContainer?.location.row * 3 + newContainer?.location.column; //Row * numCol * col
        newContainers.push(newContainer);
      }
    }
    setGridContainers(newContainers.sort().reverse());
  };

  return (
    <>
      <div className="grid grid-cols-3 grid-rows-3 gap-4 " dir="rtl">
        {gridContainers &&
          gridContainers?.map((container) => (
            <div
              key={container.index}
              className={`hover:bg-green-500 text-center`}
            >
              {container.item}
            </div>
          ))}
      </div>
      <button className="btn btn-square btn-primary" onClick={updateGrid}>
        {" "}
        Click me
      </button>
    </>
  );
}
