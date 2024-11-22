// OperationList.tsx
import React, { useState, useEffect, useRef } from "react";
import OperationCard from "./OperationCard";
import { OutputLoadOperation } from "@/lib/types";
import { getManifestData } from "@/utils/manifestCookies";
import {
  getCurrentOperationIndex,
  setCurrentOperationIndex,
} from "@/utils/operationCookies";

interface OperationListProps {
  operations: OutputLoadOperation[];
  updateManifestText: (newManifestText: string) => void;
}

const OperationList: React.FC<OperationListProps> = ({
  operations,
  updateManifestText,
}) => {
  const [currentIndex, setCurrentIndex] = useState(getCurrentOperationIndex());
  const cardRef = useRef<(HTMLDivElement | null)[]>([]);

  const handleNext = (newManifestText: string) => {
    if (currentIndex < operations.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(currentIndex + 1);
      setCurrentOperationIndex(newIndex);
      updateManifestText(newManifestText);
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
            onNext={(newManifestText: string) => handleNext(newManifestText)}
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
