
import { useState } from "react";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Player {
  id: number;
  name: string;
  skill: string;
  waitingTime: number;
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
    <div className="space-y-4">
      {players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players in queue
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto">
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
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.name}`} alt={player.name} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <Badge variant="outline" className="mt-1">{player.skill}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {player.waitingTime} min
                  </span>
                  {selected.some(p => p.id === player.id) && (
                    <div className="h-5 w-5 rounded-full bg-shuttle-blue flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selected.length > 0 && (
            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <div className="text-sm">
                {selected.length} of 4 players selected
              </div>
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
          )}
        </>
      )}
    </div>
  );
}
