// Layout.tsx
import { ReactNode } from "react";
import SignInButton from "@/components/SigninButton";

interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export default function Layout({ children, sidebar }: LayoutProps) {
  return (
    <div className="relative">
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
        <div className="flex space-x-4">
          <SignInButton />
        </div>
      </nav>
      <div className="flex flex-1 pt-16">
        <main className="flex-1 p-4 overflow-auto">{children}</main>
        <aside className="w-64 bg-gray-200 p-4 fixed top-20 right-0 bottom-0 z-10 overflow-auto">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
