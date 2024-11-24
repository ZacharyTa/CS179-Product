// Layout.tsx
import { ReactNode, useState } from "react";
import SignInButton from "@/components/SigninButton";
import { getManifestData, getManifestFileName } from "@/utils/manifestCookies";

interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export default function Layout({ children, sidebar }: LayoutProps) {
  const [manifestText, setManifestText] = useState<string | null>(null);

  const handleViewManifest = () => {
    const manifest = getManifestData();
    setManifestText(manifest);
    (
      document.getElementById("manifest-modal") as HTMLDialogElement
    )?.showModal();
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

  return (
    <div className="relative">
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
        <div className="flex space-x-4">
          <SignInButton />
          <button className="btn btn-info" onClick={handleViewManifest}>
            View Manifest
          </button>
        </div>
      </nav>
      <div className="flex flex-1 pt-16">
        <main className="flex-1 p-4 overflow-auto">{children}</main>
        <aside className="w-64 bg-gray-200 p-4 fixed top-20 right-0 bottom-0 z-10 overflow-auto">
          {sidebar}
        </aside>
      </div>
      <dialog id="manifest-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-base-content">Manifest</h3>
          <div className="py-4 max-h-96 overflow-y-auto text-base-content text-xs">
            <pre>{manifestText}</pre>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <div className="flex flex-row gap-4">
                <button className="btn btn-info" onClick={handleDownload}>
                  Download
                </button>
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-error">Close</button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
