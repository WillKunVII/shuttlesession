
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, CircleDot } from "lucide-react";

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
    <div className={`border rounded-lg p-3 ${court.status === 'available' ? 'border-shuttle-primary' : ''}`}>
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
        <div className="text-center py-2">
          <Button 
            className="w-full bg-shuttle-primary hover:bg-shuttle-primary/90" 
            disabled={!nextGameReady}
            onClick={onAssign}
          >
            Assign Next Game
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-2">
          {court.players.map((player, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 text-sm py-1 px-3 rounded-full bg-gray-100"
            >
              <CircleDot 
                className={`h-3 w-3 ${player.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`} 
              />
              <span>{player.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
