
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Court {
  id: number;
  name: string;
  status: 'available' | 'occupied';
  players: string[];
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
    <div className={`border rounded-lg p-4 ${court.status === 'available' ? 'border-shuttle-green' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{court.name}</h3>
        <Badge variant={court.status === 'available' ? 'default' : 'secondary'}>
          {court.status === 'available' ? 'Available' : 'Occupied'}
        </Badge>
      </div>
      
      {court.status === 'available' ? (
        <div className="text-center py-3">
          <Button 
            className="w-full" 
            disabled={!nextGameReady}
            onClick={onAssign}
          >
            Assign Next Game
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center mb-3">
            <Clock size={16} className="mr-2 text-muted-foreground" />
            <span className="text-sm">{court.timeRemaining} min remaining</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {court.players.map((player, idx) => (
              <div key={idx} className="bg-shuttle-lightGray text-sm py-1 px-3 rounded-full text-center truncate">
                {player}
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={onEndGame}
          >
            End Game
          </Button>
        </>
      )}
    </div>
  );
}
