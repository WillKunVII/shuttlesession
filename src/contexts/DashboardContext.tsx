
import React, { createContext, useContext } from "react";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
import { DashboardContextType } from "@/types/DashboardTypes";

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dashboardState = useDashboardLogic();
  
  return (
    <DashboardContext.Provider value={dashboardState}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
