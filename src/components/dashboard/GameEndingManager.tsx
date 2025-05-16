import { useState } from "react";
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

  const handleEndGame = (courtId: number, players: any[]) => {
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

  const handleDialogClose = () => setEndGameDialogOpen(false);

  const handleSaveResults = (winnerNames: string[]) => {
    finishEndGame(currentCourtPlayers.id, winnerNames);
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
