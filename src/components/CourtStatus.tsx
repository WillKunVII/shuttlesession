
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CourtPlayer {
  name: string;
  gender: "male" | "female";
}

interface Court {
  id: number;
  name: string;
  status: 'available' | 'occupied';
  players: CourtPlayer[];
  timeRemaining: number;
}

interface CourtStatusProps {
  court: Court;
  onAssign: () => void;
  onEndGame: () => void;
  nextGameReady: boolean;
}

export function CourtStatus({ court, onAssign, onEndGame, nextGameReady }: CourtStatusProps) {
  return (
    <div className={`border rounded-lg p-4 ${court.status === 'available' ? 'border-shuttle-primary' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{court.name}</h3>
          <Badge variant={court.status === 'available' ? 'default' : 'secondary'} 
                className={court.status === 'available' ? 'bg-shuttle-primary hover:bg-shuttle-primary/90' : ''}>
            {court.status === 'available' ? 'Available' : 'Occupied'}
          </Badge>
        </div>
        
        {court.status === 'occupied' && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={onEndGame}
          >
            <X className="h-4 w-4 mr-1" /> End
          </Button>
        )}
      </div>
      
      {court.status === 'available' ? (
        <div className="text-center py-3">
          <Button 
            className="w-full bg-shuttle-primary hover:bg-shuttle-primary/90" 
            disabled={!nextGameReady}
            onClick={onAssign}
          >
            Assign Next Game
          </Button>
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {court.players.map((player, idx) => (
            <div 
              key={idx} 
              className={`text-sm py-1 px-3 rounded-full text-center text-white
                ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}
            >
              {player.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
