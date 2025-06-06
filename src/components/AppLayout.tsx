import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
interface AppLayoutProps {
  children: ReactNode;
}
export function AppLayout({
  children
}: AppLayoutProps) {
  return <div className="flex flex-col h-screen overflow-hidden text-sm sm:text-base">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-2 bg-shuttle-primary px-[16px] py-[16px]">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(366px,1fr)_minmax(366px,1fr)] gap-4 auto-rows-max">
          {children}
        </div>
      </main>
    </div>;
}