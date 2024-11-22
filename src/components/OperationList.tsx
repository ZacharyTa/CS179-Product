// OperationList.tsx
import React, { useState, useEffect, useRef } from "react";
import OperationCard from "./OperationCard";
import { OutputLoadOperation } from "@/lib/types";
import { getManifestData, getManifestFileName } from "@/utils/manifestCookies";
import {
  getCurrentOperationIndex,
  setCurrentOperationIndex,
} from "@/utils/operationCookies";
import FinishModal from "@/components/FinishModal";
import { removeAllCookies } from "@/utils/removeAllCookies";
import { useRouter } from "next/navigation";

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
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const router = useRouter();

  const handleNext = (newManifestText: string) => {
    if (currentIndex < operations.length) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(currentIndex + 1);
      setCurrentOperationIndex(newIndex);
      updateManifestText(newManifestText);
    }
  };

  const handleDownload = () => {
    const manifestText = getManifestData();
    const manifestFileName = getManifestFileName();
    const outboundFileName = manifestFileName.replace(".txt", "OUTBOUND.txt");

    const blob = new Blob([manifestText], { type: "text/plain" });
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.download = outboundFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDone = () => {
    // clear all cookies
    removeAllCookies();
    setIsFinishModalOpen(false);
    router.push("/manifest-upload");
  };

  const handleFinish = () => {
    setIsFinishModalOpen(true);
  };

  const handleCloseFinishModal = () => {
    setIsFinishModalOpen(false);
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
          height: "25vh",
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
      {currentIndex < operations.length && (
        <div
          className="carousel-item w-full snap-center opacity-0"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "25vh",
          }}
        >
          <div className="card"></div>
        </div>
      )}
      {/* finished button */}
      {currentIndex >= operations.length && (
        <div className="flex justify-center mt-4">
          <button className="btn btn-primary" onClick={handleFinish}>
            Finish
          </button>
        </div>
      )}
      <FinishModal
        title="Cargo Loading Complete"
        body="Please make sure to download and sent Manifest Outbound to captain before closing."
        isOpen={isFinishModalOpen}
        onClose={handleCloseFinishModal}
        onDownload={handleDownload}
        onDone={handleDone}
      />
    </div>
  );
};

export default OperationList;
