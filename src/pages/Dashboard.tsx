
import { useState } from "react";
import { CourtSection } from "@/components/dashboard/CourtSection";
import { NextGameSection } from "@/components/dashboard/NextGameSection";
import { PlayerQueueSection } from "@/components/dashboard/PlayerQueueSection";
import { GameEndingManager } from "@/components/dashboard/GameEndingManager";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";

export default function Dashboard() {
  const {
    queue,
    nextGamePlayers,
    isNextGameReady,
    addPlayerToQueue,
    removePlayerFromQueue,
    generateNextGame,
    assignToFreeCourt,
    handleEndGameClick,
    finishEndGame,
    handlePlayerSelect,
    handleClearNextGame,
  } = useDashboardLogic();

  const [currentCourtId, setCurrentCourtId] = useState<number>(0);
  
  // Handle end game click and prepare dialog if needed
  const onEndGameClick = (courtId: number) => {
    const result = handleEndGameClick(courtId);
    if (result.courtId > 0) {
      setCurrentCourtId(result.courtId);
    }
  };

  return <>
    {/* Left column: Courts - stacked vertically */}
    <div className="flex flex-col space-y-3">
      <CourtSection 
        assignToFreeCourt={assignToFreeCourt}
        handleEndGameClick={onEndGameClick}
        isNextGameReady={isNextGameReady}
      />
    </div>
    
    {/* Right column: Next Game and Player Queue */}
    <div className="flex flex-col space-y-3">
      {/* Top of right column: Next Game */}
      <NextGameSection
        nextGamePlayers={nextGamePlayers}
        handleClearNextGame={handleClearNextGame}
        generateNextGame={generateNextGame}
        queueLength={queue.length}
      />
      
      {/* Bottom of right column: Player Queue */}
      <PlayerQueueSection
        queue={queue}
        handlePlayerSelect={handlePlayerSelect}
        removePlayerFromQueue={removePlayerFromQueue}
        addPlayerToQueue={addPlayerToQueue}
      />
    </div>
    
    {/* Game Ending Manager */}
    <GameEndingManager 
      finishEndGame={finishEndGame}
    />
  </>;
}
