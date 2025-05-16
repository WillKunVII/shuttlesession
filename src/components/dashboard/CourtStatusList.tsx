
import React from "react";
import { CourtStatus } from "@/components/CourtStatus";
import { useDashboard } from "@/contexts/DashboardContext";

export function CourtStatusList() {
  const { 
    sortedCourts, 
    assignToFreeCourt, 
    handleEndGameClick, 
    isNextGameReady 
  } = useDashboard();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <h2 className="text-xl font-semibold mb-3">Court Status</h2>
      <div className="flex flex-col space-y-3">
        {sortedCourts.map(court => (
          <CourtStatus 
            key={court.id} 
            court={court} 
            onAssign={() => assignToFreeCourt(court.id)} 
            onEndGame={() => handleEndGameClick(court.id)} 
            nextGameReady={isNextGameReady()} 
          />
        ))}
      </div>
    </div>
  );
}
