import React from "react";

interface FinishModalProps {
  title: string;
  body: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onDone: () => void;
}

const FinishModal: React.FC<FinishModalProps> = ({
  title,
  body,
  isOpen,
  onClose,
  onDownload,
  onDone,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-md">
        <h2 className="text-base-content text-xl font-bold mb-4">{title}</h2>
        <p className="text-base-content mb-4">{body}</p>
        <div className="flex justify-end space-x-4">
          <button className="btn btn-primary" onClick={onDownload}>
            Download
          </button>
          <button className="btn btn-secondary" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishModal;
