import React from "react";
import { CourtStatusList } from "@/components/dashboard/CourtStatusList";
import { NextGameSection } from "@/components/dashboard/NextGameSection";
import { PlayerQueueSection } from "@/components/dashboard/PlayerQueueSection";
import { EndGameDialog } from "@/components/EndGameDialog";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { useState } from "react";
import { PreSessionSettings } from "@/components/settings/PreSessionSettings";

// Inner component that uses the dashboard context
function DashboardContent() {
  const { 
    endGameDialogOpen, 
    setEndGameDialogOpen, 
    currentCourtPlayers, 
    finishEndGame 
  } = useDashboard();

  const [showSessionSettings, setShowSessionSettings] = useState(false);

  // Always provide a fallback for players
  const courtPlayers = currentCourtPlayers && Array.isArray(currentCourtPlayers.players) 
    ? currentCourtPlayers.players 
    : [];
  const courtId = currentCourtPlayers && typeof currentCourtPlayers.id === "number"
    ? currentCourtPlayers.id
    : 0;

  // Convert CourtPlayer[] to Player[] for EndGameDialog
  const courtPlayersAsPlayers = courtPlayers.map((p, idx) => ({
    id: Date.now() + idx, // Use timestamp + idx as dummy unique id
    name: p.name,
    gender: p.gender,
    waitingTime: 0,
    isGuest: p.isGuest,
  }));

  return (
    <>
      {/* Session Settings dialog button */}
      <div className="flex justify-end mb-2">
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-app-primary-700 h-9 rounded-md px-3"
          onClick={() => setShowSessionSettings(true)}
        >
          Edit Game Settings
        </button>
      </div>
      <PreSessionSettings isOpen={showSessionSettings} onClose={() => setShowSessionSettings(false)} />
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
        players={courtPlayersAsPlayers}
        onSaveResults={winnerNames => finishEndGame(courtId, winnerNames)} 
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
