"use client";
import React, { useState, useEffect } from "react";
import { Container, OutputLoadOperation } from "@/lib/types";
import { useGridData } from "@/hooks/useGridData";

interface ShipGridProps {
  containers?: Container[];
  columns: number;
  rows: number;
  loading: boolean;
  operations?: OutputLoadOperation[];
  onSelectContainer?: (container: Container) => void;
}

const ShipGrid: React.FC<ShipGridProps> = ({
  containers = [],
  columns,
  rows,
  loading,
  operations,
  onSelectContainer,
}) => {
  const { gridSlots, selectedGridSlots } = useGridData({
    containers,
    columns,
    rows,
  });

  const [offloadSlots, setOffloadSlots] = useState<Set<number>>(new Set());

  useEffect(() => {
    const gridSize = columns * rows;
    const slots = new Set<number>();

    operations?.forEach((operation) => {
      if (operation.type === "offload") {
        const rowIndex = operation.oldRow - 1;
        const colIndex = operation.oldColumn - 1;
        const index = gridSize - (rowIndex * columns + colIndex) - 1;
        slots.add(index);
      }
    });
    setOffloadSlots(slots);
  }, [operations, columns, rows]);

  const handleSlotClick = (slot: Container | null, index: number) => {
    if (loading && slot && slot.item !== "UNUSED" && slot.item !== "NAN") {
      onSelectContainer && onSelectContainer(slot);
    }
  };

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
              className={`flex items-center justify-center text-center border aspect-square text-[6px] ${
                slot
                  ? offloadSlots.has(index)
                    ? "bg-success"
                    : slot.item === "UNUSED"
                      ? "bg-secondary/50"
                      : slot.item === "NAN"
                        ? "bg-black text-white"
                        : "bg-base-300 text-base-content"
                  : "bg-white"
              } hover:opacity-70`}
              onClick={() => handleSlotClick(slot, index)}
            >
              <span className="truncate">{slot ? slot?.item : "Empty"}</span>
            </div>
          ))}
      </div>
    </>
  );
};

export default ShipGrid;
