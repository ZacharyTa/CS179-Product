"use client";
import React, { useState } from "react";
import handleBalancing from "@/utils/handleBalancing";

interface ManifestUploadProps {
  onManifestUpload: (manifestText: string) => void; // Pass this to parent component
}

const ManifestUpload: React.FC<ManifestUploadProps> = ({
  onManifestUpload,
}) => {
  const [manifestText, setManifestText] = useState<string>("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const text = await file.text();
      setManifestText(text);
      onManifestUpload(text);


      
      const balancingOperations = handleBalancing(text);
      console.log("From handleBalancing: ", balancingOperations);

    }
  };
  return (
    <div>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text text-white">Upload Manifest</span>
        </div>
        <input
          type="file"
          accept=".txt"
          className="file-input file-input-bordered file-input-primary text-base-content file-input-sm w-full max-w-xs"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default ManifestUpload;
