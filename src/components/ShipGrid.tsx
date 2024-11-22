"use client";
import { useState } from "react";
import { Container } from "@/lib/types";
import { useGridData } from "@/hooks/useGridData";

interface ShipGridProps {
  containers?: Container[];
  columns: number;
  rows: number;
}

const ShipGrid: React.FC<ShipGridProps> = ({
  containers = [],
  columns,
  rows,
}) => {
  const { gridSlots, selectedGridSlots, selectGridSlot } = useGridData({
    containers,
    columns,
    rows,
  });

  return (
    <>
      <div
        className={`grid gap-1 bg-transparent`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
        dir="rtl"
      >
        {gridSlots &&
          gridSlots?.map((slot, index) => (
            <div
              key={index}
              className={`flex items-center justify-center text-center border aspect-square text-xs ${
                slot
                  ? selectedGridSlots.has(index)
                    ? "bg-success"
                    : slot.item === "UNUSED"
                      ? "bg-secondary/50"
                      : slot.item === "NAN"
                        ? "bg-black text-white"
                        : "bg-base-300 text-base-content"
                  : "bg-white"
              } hover:opacity-70`}
              onClick={() => slot?.item !== "NAN" && selectGridSlot(index)}
            >
              <span className="truncate">{slot ? slot?.item : "Empty"}</span>
            </div>
          ))}
      </div>
    </>
  );
};

export default ShipGrid;
