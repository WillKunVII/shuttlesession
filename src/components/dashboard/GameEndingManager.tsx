
import { useState, useEffect } from "react";
import { EndGameDialog } from "@/components/EndGameDialog";

interface GameEndingManagerProps {
  finishEndGame: (courtId: number, winnerNames: string[]) => void;
}

export function GameEndingManager({ finishEndGame }: GameEndingManagerProps) {
  // State for end game dialog
  const [endGameDialogOpen, setEndGameDialogOpen] = useState(false);
  const [currentCourtPlayers, setCurrentCourtPlayers] = useState<{
    id: number;
    players: any[];
  }>({
    id: 0,
    players: []
  });

  useEffect(() => {
    // Listen for custom events from the useDashboardLogic
    const handleEndGameEvent = (event: CustomEvent) => {
      const { courtId, players } = event.detail;
      handleEndGame(courtId, players);
    };

    // Add event listener
    window.addEventListener('endGame' as any, handleEndGameEvent as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('endGame' as any, handleEndGameEvent as EventListener);
    };
  }, []);

  const handleEndGame = (courtId: number, players: any[]) => {
    console.log("GameEndingManager handling end game for court:", courtId, "players:", players);
    if (players.length > 0) {
      // Check if score keeping is enabled
      const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") === "true";
      if (isScoreKeepingEnabled) {
        // Open dialog to select winners
        setCurrentCourtPlayers({
          id: courtId,
          players
        });
        setEndGameDialogOpen(true);
      } else {
        // Just end the game normally without tracking scores
        finishEndGame(courtId, []);
      }
    }
  };

  const handleDialogClose = () => {
    setEndGameDialogOpen(false);
    
    // If dialog is closed without selecting winners, still end the game
    if (currentCourtPlayers.id > 0) {
      finishEndGame(currentCourtPlayers.id, []);
      setCurrentCourtPlayers({ id: 0, players: [] });
    }
  };

  const handleSaveResults = (winnerNames: string[]) => {
    if (currentCourtPlayers.id > 0) {
      finishEndGame(currentCourtPlayers.id, winnerNames);
      setCurrentCourtPlayers({ id: 0, players: [] });
    }
    setEndGameDialogOpen(false);
  };

  return (
    <>
      <EndGameDialog 
        isOpen={endGameDialogOpen} 
        onClose={handleDialogClose} 
        players={currentCourtPlayers.players} 
        onSaveResults={handleSaveResults}
      />
    </>
  );
}
