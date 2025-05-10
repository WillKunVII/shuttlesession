
import { useState } from "react";
import { Check, CircleDot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPlayerButton } from "@/components/AddPlayerButton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Player {
  id: number;
  name: string;
  skill: string;
  waitingTime: number;
  gender: "male" | "female";
  isGuest?: boolean;
}

interface PlayerQueueProps {
  players: Player[];
  onPlayerSelect: (selectedPlayers: Player[]) => void;
  onPlayerLeave?: (playerId: number) => void;
  onAddPlayer?: (player: {name: string, gender: "male" | "female", isGuest: boolean}) => void;
}

export function PlayerQueue({ players, onPlayerSelect, onPlayerLeave, onAddPlayer }: PlayerQueueProps) {
  const [selected, setSelected] = useState<Player[]>([]);
  
  const togglePlayerSelection = (player: Player) => {
    if (selected.some(p => p.id === player.id)) {
      setSelected(selected.filter(p => p.id !== player.id));
    } else if (selected.length < 4) {
      setSelected([...selected, player]);
    }
  };
  
  const handleAddPlayer = (player: {name: string, gender: "male" | "female", isGuest: boolean}) => {
    if (onAddPlayer) {
      onAddPlayer(player);
    }
  };
  
  return (
    <div className="space-y-4 max-h-[calc(100vh-24rem)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Player Queue</h2>
        <div className="flex gap-2">
          <AddPlayerButton 
            variant="outline" 
            onAddPlayer={handleAddPlayer}
          />
          
          <Button
            size="sm"
            disabled={selected.length !== 4}
            onClick={() => {
              onPlayerSelect(selected);
              setSelected([]);
            }}
          >
            Create Game
          </Button>
        </div>
      </div>
      
      {players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players in queue
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-30rem)]">
          <div className="space-y-2 pr-4">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`border rounded-lg p-3 flex items-center justify-between cursor-pointer ${
                  selected.some(p => p.id === player.id) 
                    ? "bg-shuttle-lightBlue border-shuttle-blue" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => togglePlayerSelection(player)}
              >
                <div className="flex items-center gap-2">
                  <CircleDot className={player.gender === 'male' ? 'text-blue-500' : 'text-pink-500'} size={16} />
                  <span className="font-medium">{player.name}</span>
                  {player.isGuest && (
                    <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
                  )}
                </div>
                <div className="flex items-center">
                  {selected.some(p => p.id === player.id) && (
                    <div className="h-5 w-5 rounded-full bg-shuttle-blue flex items-center justify-center mr-2">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPlayerLeave) onPlayerLeave(player.id);
                    }}
                  >
                    Leave
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
