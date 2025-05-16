
import React from "react";
import { CourtStatusList } from "@/components/dashboard/CourtStatusList";
import { NextGameSection } from "@/components/dashboard/NextGameSection";
import { PlayerQueueSection } from "@/components/dashboard/PlayerQueueSection";
import { EndGameDialog } from "@/components/EndGameDialog";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";

// Inner component that uses the dashboard context
function DashboardContent() {
  const { 
    endGameDialogOpen, 
    setEndGameDialogOpen, 
    currentCourtPlayers, 
    finishEndGame 
  } = useDashboard();
  
  return (
    <>
      {/* Left column: Courts - stacked vertically */}
      <div className="flex flex-col space-y-3">
        <CourtStatusList />
      </div>
      
      {/* Right column: Next Game and Player Queue */}
      <div className="flex flex-col space-y-3">
        {/* Top of right column: Next Game */}
        <NextGameSection />
        
        {/* Bottom of right column: Player Queue */}
        <PlayerQueueSection />
      </div>
      
      {/* End Game Dialog */}
      <EndGameDialog 
        isOpen={endGameDialogOpen} 
        onClose={() => setEndGameDialogOpen(false)} 
        players={currentCourtPlayers.players} 
        onSaveResults={winnerNames => finishEndGame(currentCourtPlayers.id, winnerNames)} 
      />
    </>
  );
}

// Main Dashboard component that provides the context
export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
