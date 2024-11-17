"use client";
import { useState } from "react";
import ShipGrid from "@/components/ShipGrid";
import ManifestUpload from "@/components/ManifestUpload";
import useManifestData from "@/hooks/useManifestData";
import SignInButton from "@/components/SigninButton";
import MessageModal from "@/components/MessageModal";

export default function WorkPage() {
  const [manifestText, setManifestText] = useState<string>("");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  function handleManifestUpload(text: string) {
    setManifestText(text);
  }

  const manifestData = useManifestData(manifestText);

  const handleOpenMessageModal = () => {
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
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
