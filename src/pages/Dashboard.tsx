
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayerQueue } from "@/components/PlayerQueue";
import { NextGame } from "@/components/NextGame";
import { CourtStatus } from "@/components/CourtStatus";
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { useGameAssignment, Player } from "@/hooks/useGameAssignment";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";

export default function Dashboard() {
  // Use our custom hooks
  const { queue, addPlayerToQueue, removePlayerFromQueue, addPlayersToQueue, removePlayersFromQueue, autoSelectPlayers } = usePlayerQueue();
  const { nextGamePlayers, setNextGame, clearNextGame, isNextGameReady } = useGameAssignment();
  const { getSortedCourts, assignPlayersToCourtById, endGameOnCourt } = useCourtManagement();

  // Get sorted courts
  const sortedCourts = getSortedCourts();

  // Function to generate next game players (auto mode)
  const generateNextGame = () => {
    if (queue.length >= 4) {
      const selectedPlayers = autoSelectPlayers(4);
      setNextGame(selectedPlayers);
    }
  };

  // Function to assign next game to a court
  const assignToFreeCourt = (courtId: number) => {
    if (isNextGameReady()) {
      const success = assignPlayersToCourtById(courtId, nextGamePlayers);
      if (success) {
        clearNextGame();
      }
    }
  };

  // Function to end a game on a court
  const endGame = (courtId: number) => {
    const releasedPlayers = endGameOnCourt(courtId);
    
    if (releasedPlayers.length > 0) {
      // Add players back to the queue with proper properties
      const playerObjects: Player[] = releasedPlayers.map((player, idx) => ({
        id: Date.now() + idx,
        name: player.name,
        gender: player.gender as "male" | "female",
        skill: ["beginner", "intermediate", "advanced"][Math.floor(Math.random() * 3)],
        waitingTime: 0,
        isGuest: player.isGuest
      }));
      
      addPlayersToQueue(playerObjects);
    }
  };

  // Handle player selection for next game
  const handlePlayerSelect = (selectedPlayers: Player[]) => {
    if (selectedPlayers.length === 4) {
      setNextGame(selectedPlayers);
      
      // Remove selected players from queue
      const playerIds = selectedPlayers.map(p => p.id);
      removePlayersFromQueue(playerIds);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left column: Courts - stacked vertically */}
      <div className="flex flex-col space-y-3">
        <div className="bg-white rounded-xl shadow-sm p-3">
          <h2 className="text-xl font-semibold mb-3">Court Status</h2>
          <div className="flex flex-col space-y-3">
            {sortedCourts.map(court => (
              <CourtStatus 
                key={court.id}
                court={court}
                onAssign={() => assignToFreeCourt(court.id)}
                onEndGame={() => endGame(court.id)}
                nextGameReady={isNextGameReady()}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Right column: Next Game and Player Queue */}
      <div className="flex flex-col space-y-3">
        {/* Top of right column: Next Game */}
        <div className="bg-white rounded-xl shadow-sm p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Next Game</h2>
            <Button 
              variant="outline" 
              onClick={() => generateNextGame()}
              disabled={queue.length < 4}
              size="sm"
            >
              Auto-Select Players
            </Button>
          </div>
          <NextGame 
            players={nextGamePlayers}
            onClear={() => {
              // Put players back in the queue
              addPlayersToQueue(clearNextGame());
            }}
          />
        </div>
        
        {/* Bottom of right column: Player Queue */}
        <div className="bg-white rounded-xl shadow-sm p-3">
          <PlayerQueue 
            players={queue} 
            onPlayerSelect={handlePlayerSelect}
            onPlayerLeave={removePlayerFromQueue}
            onAddPlayer={(player) => addPlayerToQueue(player)}
          />
        </div>
      </div>
    </div>
  );
}
