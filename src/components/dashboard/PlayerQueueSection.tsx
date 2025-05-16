
import { PlayerQueue } from "@/components/PlayerQueue";
import { Player } from "@/types/playerTypes";

interface PlayerQueueSectionProps {
  queue: Player[];
  handlePlayerSelect: (selectedPlayers: Player[]) => void;
  removePlayerFromQueue: (playerId: string) => void;
  addPlayerToQueue: (player: {name: string, gender: "male" | "female", isGuest: boolean}) => void;
}

export function PlayerQueueSection({ 
  queue, 
  handlePlayerSelect, 
  removePlayerFromQueue, 
  addPlayerToQueue 
}: PlayerQueueSectionProps) {
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
