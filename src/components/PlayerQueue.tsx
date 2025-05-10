
import { useState } from "react";
import { Check, CircleDot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPlayerButton } from "@/components/AddPlayerButton";

interface Player {
  id: number;
  name: string;
  skill: string;
  waitingTime: number;
  gender: "male" | "female";
}

interface PlayerQueueProps {
  players: Player[];
  onPlayerSelect: (selectedPlayers: Player[]) => void;
}

export function PlayerQueue({ players, onPlayerSelect }: PlayerQueueProps) {
  const [selected, setSelected] = useState<Player[]>([]);
  
  const togglePlayerSelection = (player: Player) => {
    if (selected.some(p => p.id === player.id)) {
      setSelected(selected.filter(p => p.id !== player.id));
    } else if (selected.length < 4) {
      setSelected([...selected, player]);
    }
  };
  
  return (
    <div className="space-y-4 max-h-[calc(100vh-24rem)]">
      <div className="flex justify-between items-center mb-4">
        <AddPlayerButton variant="outline" />
        
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <div className="text-sm">
              {selected.length} of 4 players
            </div>
          )}
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
        <div className="space-y-2 overflow-y-auto">
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                >
                  Leave
                </Button>
              </div>
              {selected.some(p => p.id === player.id) && (
                <div className="h-5 w-5 rounded-full bg-shuttle-blue flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
