
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { useGameAssignment } from "@/hooks/useGameAssignment";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { useGameEnding } from "@/hooks/useGameEnding";
import { useNextGameAssignment } from "@/hooks/useNextGameAssignment";
import { usePlayerSelection } from "@/hooks/usePlayerSelection";
import { useState } from "react";

export function useDashboardLogic() {
  // Use our custom hooks
  const {
    queue,
    addPlayerToQueue,
    removePlayerFromQueue,
    addPlayersToQueue
  } = usePlayerQueue();
  
  const {
    nextGamePlayers,
    isNextGameReady
  } = useGameAssignment();
  
  const {
    getSortedCourts
  } = useCourtManagement();

  const {
    handleEndGameClick,
    finishEndGame
  } = useGameEnding();

  const {
    assignToFreeCourt
  } = useNextGameAssignment();

  const {
    handlePlayerSelect,
    handleClearNextGame,
    generateNextGame
  } = usePlayerSelection();

  // State for end game result
  const [endGameResult, setEndGameResult] = useState<{courtId: number, players: any[]}>({ courtId: 0, players: [] });

  return {
    queue,
    nextGamePlayers,
    getSortedCourts,
    isNextGameReady,
    addPlayerToQueue,
    removePlayerFromQueue,
    generateNextGame,
    assignToFreeCourt,
    handleEndGameClick,
    finishEndGame,
    handlePlayerSelect,
    handleClearNextGame,
  };
}
