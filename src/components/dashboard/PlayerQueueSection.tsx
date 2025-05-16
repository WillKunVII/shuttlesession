
import React from "react";
import { PlayerQueue } from "@/components/PlayerQueue";
import { useDashboard } from "@/contexts/DashboardContext";

export function PlayerQueueSection() {
  const { queue, handlePlayerSelect, removePlayerFromQueue, addPlayerToQueue } = useDashboard();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <PlayerQueue 
        players={queue} 
        onPlayerSelect={handlePlayerSelect} 
        onPlayerLeave={removePlayerFromQueue} 
        onAddPlayer={player => addPlayerToQueue(player)} 
      />
    </div>
  );
}
