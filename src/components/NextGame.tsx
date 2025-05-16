
import { Button } from "@/components/ui/button";

interface Player {
  id: number;
  name: string;
  waitingTime: number;
  gender: "male" | "female";
  isGuest?: boolean;
}

interface NextGameProps {
  players: Player[];
  onClear: () => void;
}

export function NextGame({ players, onClear }: NextGameProps) {
  return (
    <div className="border rounded-lg p-3">
      {players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No game ready. Select players from the queue.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-2 text-sm py-1 px-3 rounded-full bg-gray-100">
                <span className={`h-2 w-2 rounded-full ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                <span>{player.name}</span>
                {player.isGuest && (
                  <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClear}
            >
              Clear Selection
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
