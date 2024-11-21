// OperationList.tsx
import React, { useState, useEffect, useRef } from "react";
import OperationCard from "./OperationCard";
import { OutputLoadOperation } from "@/lib/types";

interface OperationListProps {
  operations: OutputLoadOperation[];
}

const OperationList: React.FC<OperationListProps> = ({ operations }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRef = useRef<(HTMLDivElement | null)[]>([]);

  const handleNext = () => {
    if (currentIndex < operations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    const currentCard = cardRef.current[currentIndex];
    if (currentCard) {
      currentCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIndex]);

  return (
    <div
      id="operation-list"
      className="carousel carousel-vertical h-full overflow-y-auto snap-y snap-mandatory gap-4"
    >
      {/* Dummy card at the beginning */}
      <div
        className="carousel-item w-full snap-center opacity-0"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="card"></div>
      </div>

      {operations.map((operation, index) => (
        <div
          key={index}
          ref={(element) => {
            cardRef.current[index] = element;
          }}
          className={`carousel-item w-full snap-center ${
            index === currentIndex ? "opacity-100" : "opacity-50"
          }`}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <OperationCard
            operation={operation}
            showNextButton={index === currentIndex}
            onNext={handleNext}
          />
        </div>
      ))}

      {/* Dummy card at the end */}
      <div
        className="carousel-item w-full snap-center opacity-0"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="card"></div>
      </div>
    </div>
  );
};

export default OperationList;
