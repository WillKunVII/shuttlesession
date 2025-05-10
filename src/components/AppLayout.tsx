
import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-2 bg-shuttle-gray">
        {children}
      </main>
    </div>
  );
}
