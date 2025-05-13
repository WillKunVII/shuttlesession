import { useState } from "react";
import { Check, CircleDot, Plus, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPlayerButton } from "@/components/AddPlayerButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Player {
  id: number;
  name: string;
  waitingTime: number;
  gender: "male" | "female";
  isGuest?: boolean;
  wins?: number;
  losses?: number;
}

interface PlayerQueueProps {
  players: Player[];
  onPlayerSelect: (selectedPlayers: Player[]) => void;
  onPlayerLeave?: (playerId: number) => void;
  onAddPlayer?: (player: {name: string, gender: "male" | "female", isGuest: boolean}) => void;
}

export function PlayerQueue({ players, onPlayerSelect, onPlayerLeave, onAddPlayer }: PlayerQueueProps) {
  const [selected, setSelected] = useState<Player[]>([]);
  const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") === "true";
  // Get player pool size from localStorage or default to 8
  const playerPoolSize = Number(localStorage.getItem("playerPoolSize")) || 8;
  
  const togglePlayerSelection = (player: Player) => {
    setSelected(prev => {
      // Check if player is already selected
      if (prev.some(p => p.id === player.id)) {
        // If selected, remove them
        return prev.filter(p => p.id !== player.id);
      } 
      // If not selected and we haven't reached the limit yet, add them
      else if (prev.length < 4) {
        return [...prev, player];
      }
      // Otherwise don't change anything
      return prev;
    });
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
            {players.map((player, index) => (
              <div key={player.id}>
                {index === playerPoolSize && players.length > playerPoolSize && (
                  <div className="relative my-4">
                    <Separator className="absolute inset-0 my-2" />
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-xs text-muted-foreground">
                        Player Pool Limit
                      </span>
                    </div>
                  </div>
                )}
                <div 
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
                    
                    {isScoreKeepingEnabled && (player.wins !== undefined || player.losses !== undefined) && (
                      <span className="ml-1 text-sm text-gray-500">
                        W {player.wins || 0} – L {player.losses || 0}
                      </span>
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
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
