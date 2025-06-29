
import { createContext } from "react";
import { DashboardContextType } from "./types";

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);
