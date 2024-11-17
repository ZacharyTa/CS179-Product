"use client";
import { useState, useEffect } from "react";
import ShipGrid from "@/components/ShipGrid";
import ManifestUpload from "@/components/ManifestUpload";
import useManifestData from "@/hooks/useManifestData";
import SignInButton from "@/components/SigninButton";
import MessageModal from "@/components/MessageModal";
import CargoLoadInput from "@/components/CargoLoadInput";
import Cookies from "js-cookie";

export default function WorkPage() {
  const [manifestText, setManifestText] = useState<string>("");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState<boolean>(false);
  const [isCargoLoadModalOpen, setIsCargoLoadModalOpen] =
    useState<boolean>(false);
  // const [operations, setOperations] =
  // useState <

  useEffect(() => {
    const savedManifestText = Cookies.get("manifestText");
    if (savedManifestText) {
      setManifestText(savedManifestText);
    }
  }, []);

  function handleManifestUpload(text: string) {
    setManifestText(text);
    Cookies.set("manifestText", text);
  }

  const manifestData = useManifestData(manifestText);

  const handleOpenMessageModal = () => {
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
  };

  const handleOpenCargoLoadModal = () => {
    setIsCargoLoadModalOpen(true);
  };

  const handleCloseCargoLoadModal = () => {
    setIsCargoLoadModalOpen(false);
  };

  return (
    <div className="grid grid-cols-7 gap-4">
      <div className="col-span-1">
        <div className="mb-10">
          <SignInButton />
          <button
            className="btn btn-outline btn-primary"
            onClick={handleOpenMessageModal}
          >
            Open Modal
          </button>
          {isMessageModalOpen && (
            <MessageModal
              title="Title"
              message="idk"
              onClose={handleCloseMessageModal}
            />
          )}
        </div>
        <div className="mb-10">
          <button
            className="btn btn-outline btn-primary"
            onClick={handleOpenCargoLoadModal}
          >
            Onload Cargo
          </button>
          {isCargoLoadModalOpen && (
            <CargoLoadInput
              isOpen={isCargoLoadModalOpen}
              onClose={handleCloseCargoLoadModal}
            />
          )}
        </div>
        <ManifestUpload onManifestUpload={handleManifestUpload} />
      </div>
      {/* <div className="col-span-1"></div> */}
      <div className="col-span-4 col-start-2 col-end-6">
        <p className="text-center">Ship Grid</p>
        {manifestData && (
          <ShipGrid
            columns={manifestData.columns}
            rows={manifestData.rows}
            containers={manifestData.containers}
          />
        )}
      </div>
      <div className="col-span-2 col-start-6 col-end-7">
        <p className="text-center">Instructions</p>
      </div>
    </div>
  );
}
