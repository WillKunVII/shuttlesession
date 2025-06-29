
import React from "react";
import { CourtStatusList } from "@/components/dashboard/CourtStatusList";
import { NextGameSection } from "@/components/dashboard/NextGameSection";
import { PlayerQueueSection } from "@/components/dashboard/PlayerQueueSection";
import { EndGameDialog } from "@/components/EndGameDialog";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { useState } from "react";

// Inner component that uses the dashboard context
function DashboardContent() {
  const { 
    endGameDialogOpen, 
    setEndGameDialogOpen, 
    currentCourtPlayers, 
    finishEndGame 
  } = useDashboard();

  // Always provide a fallback for players
  const courtPlayers = currentCourtPlayers && Array.isArray(currentCourtPlayers.players) 
    ? currentCourtPlayers.players 
    : [];
  const courtId = currentCourtPlayers && typeof currentCourtPlayers.id === "number"
    ? currentCourtPlayers.id
    : 0;

  console.log("Dashboard: Court players for EndGameDialog", courtPlayers);

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
      {/* End Game Dialog - now using actual court players with preserved IDs */}
      <EndGameDialog 
        isOpen={endGameDialogOpen} 
        onClose={() => setEndGameDialogOpen(false)} 
        players={courtPlayers} // Use actual court players with their IDs
        onSaveResults={winnerNames => {
          console.log("Dashboard: Saving results with winner names:", winnerNames);
          finishEndGame(courtId, winnerNames);
        }} 
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
