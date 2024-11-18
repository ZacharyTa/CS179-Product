import React, { useState } from "react";

interface CargoLoadInputProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CargoLoadInput({
  isOpen,
  onClose,
}: CargoLoadInputProps) {
  const [cargoName, setCargoName] = useState<string>("");

  return (
    <div className="modal-box">
      <h3 className="font-bold text-lg text-base-content">
        Enter Cargo Name to onload
      </h3>
      <input
        type="text"
        placeholder="Rick's Baseball"
        className="input input-bordered w-full max-w-xs text-base-content"
        value={cargoName}
        onChange={(e) => setCargoName(e.target.value)}
      />
      <div className="modal-action">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-primary" onClick={onClose}>
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
