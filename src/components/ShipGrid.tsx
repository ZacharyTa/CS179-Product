"use client";
import React, { useState, useEffect } from "react";
import { Container, OutputLoadOperation } from "@/lib/types";
import { useGridData } from "@/hooks/useGridData";
import { getCurrentOperation } from "@/utils/operationCookies";
import { Target, Circle } from "lucide-react";

interface ShipGridProps {
  containers?: Container[];
  columns: number;
  rows: number;
  loading: boolean;
  operations?: OutputLoadOperation[];
  onSelectContainer?: (container: Container) => void;
  currentOperationIndex: number;
}

const ShipGrid: React.FC<ShipGridProps> = ({
  containers = [],
  columns,
  rows,
  loading,
  operations,
  onSelectContainer,
  currentOperationIndex,
}) => {
  const { gridSlots } = useGridData({
    containers,
    columns,
    rows,
  });

  const [offloadSlots, setOffloadSlots] = useState<Set<number>>(new Set());

  // Highlighting old col/row and new col/row
  const [oldIndex, setOldIndex] = useState<number | null>(null);
  const [newIndex, setNewIndex] = useState<number | null>(null);

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

  useEffect(() => {
    const operation = getCurrentOperation();
    if (operation) {
      const { oldRow, oldColumn, newRow, newColumn } = operation;
      const gridSize = columns * rows;

      if (oldColumn > 0) {
        const oldIndex = (oldRow - 1) * columns + (oldColumn - 1);
        setOldIndex(gridSize - oldIndex - 1);
      } else {
        setOldIndex(null);
      }

      if (newColumn > 0) {
        const newIndex = (newRow - 1) * columns + (newColumn - 1);
        setNewIndex(gridSize - newIndex - 1);
      } else {
        setNewIndex(null);
      }
    } else {
      setOldIndex(null);
      setNewIndex(null);
    }
  }, [currentOperationIndex]);

  const handleSlotClick = (slot: Container | null) => {
    if (loading && slot && slot.item !== "UNUSED" && slot.item !== "NAN") {
      if (onSelectContainer) {
        onSelectContainer(slot);
      }
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
          gridSlots?.map((slot, index) => {
            const isOld = index === oldIndex;
            const isNew = index === newIndex;
            const cellClass = isOld
              ? "outline outline-dashed outline-offset-1 outline-yellow-300"
              : isNew
                ? "outline outline-dashed outline-offset-1 outline-green-300"
                : "";
            return (
              <div
                key={index}
                className={`flex items-center justify-center text-center border aspect-square ${loading ? "text-[12px]" : "text-[12px]"} ${cellClass} ${
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
                onClick={() => handleSlotClick(slot)}
              >
                <span className="truncate">{slot ? slot?.item : "Empty"}</span>
                {isNew && (
                  <Target className="absolute w-12 h-12 animate-pulse opacity-0 text-error" />
                )}{" "}
                {isOld && (
                  <Circle className="absolute w-12 h-12 animate-pulse opacity-0 text-warning" />
                )}{" "}
              </div>
            );
          })}
      </div>
    </>
  );
};

export default ShipGrid;
