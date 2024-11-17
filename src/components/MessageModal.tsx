interface MessageModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export default function MessageModal({
  title,
  message,
  onClose,
}: MessageModalProps) {
  return (
    <div className="modal-box">
      <h3 className="font-bold text-lg text-base-content">{title}!</h3>
      <p className="py-4 text-base-content">{message}</p>
      <div className="modal-action">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
}
