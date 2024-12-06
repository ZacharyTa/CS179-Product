"use client";
import React, { useEffect, useState } from "react";
import { Target, Circle } from "lucide-react";
import { getCurrentOperation } from "@/utils/operationCookies";

interface PinkGridProps {
  columns: number;
  shipGrid: boolean;
  currentOperationIndex: number;
}

const PinkGrid: React.FC<PinkGridProps> = ({
  columns,
  shipGrid,
  currentOperationIndex,
}) => {
  const [isNewShip, setIsNewShip] = useState(false);
  const [isOldShip, setIsOldShip] = useState(false);
  const [isNewBuffer, setIsNewBuffer] = useState(false);
  const [isOldBuffer, setIsOldBuffer] = useState(false);

  useEffect(() => {
    const operation = getCurrentOperation();
    if (operation) {
      const { oldRow, oldColumn, newRow, newColumn } = operation;

      setIsNewShip(newColumn === 1 && newRow === 9);
      setIsOldShip(oldColumn === 1 && oldRow === 9);
      setIsNewBuffer(newColumn === -1 && newRow === 5);
      setIsOldBuffer(oldColumn === -1 && oldRow === 5);
    }
  }, [currentOperationIndex]); // You may want to add dependencies based on how your state updates

  return (
    <div
      className="grid gap-1 bg-transparent"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
      }}
      dir={shipGrid ? "ltr" : "rtl"}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <div
          key={index}
          className={`relative flex items-center justify-center text-center border aspect-square text-[12px] ${
            index === 0 ? "bg-pink-500/50 outline-pink-800" : "opacity-0"
          }`}
        >
          {index === 0 && (
            <>
              {shipGrid && isNewShip && (
                <Target className="absolute w-12 h-12 animate-pulse text-error" />
              )}
              {shipGrid && isOldShip && (
                <Circle className="absolute w-12 h-12 animate-pulse text-warning" />
              )}
              {!shipGrid && isNewBuffer && (
                <Target className="absolute w-12 h-12 animate-pulse text-error" />
              )}
              {!shipGrid && isOldBuffer && (
                <Circle className="absolute w-12 h-12 animate-pulse text-warning" />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default PinkGrid;
