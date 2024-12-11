import React, { useState } from "react";
import { addLog } from "@/utils/logCookies";
import toast, { Toaster } from "react-hot-toast";

export default function Log() {
  const [comment, setComment] = useState<string>("");

  const handleSubmit = () => {
    if (comment.trim()) {
      addLog(`\"\"${comment}\"\"`);
      toast.success("Comment Added");
      setComment("");
    } else {
      toast.error("Couldn't log comment");
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4">
      <textarea
        className="flex-grow p-2 border border-gray-300 rounded-md text-base-content"
        rows={4}
        placeholder="Type your comment here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button className="btn btn-accent" onClick={handleSubmit}>
        Submit Comment
      </button>
      <Toaster />
    </div>
  );
}
