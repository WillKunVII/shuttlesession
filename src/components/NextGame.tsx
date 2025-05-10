
import { Button } from "@/components/ui/button";
import { CircleDot } from "lucide-react";

interface Player {
  id: number;
  name: string;
  skill: string;
  waitingTime: number;
  gender: "male" | "female";
}

interface NextGameProps {
  players: Player[];
  onClear: () => void;
}

export function NextGame({ players, onClear }: NextGameProps) {
  return (
    <div className="border rounded-lg p-4">
      {players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No game ready. Select players from the queue.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-2 text-sm py-1 px-3 rounded-full bg-gray-100">
                <CircleDot 
                  className={`h-3 w-3 ${player.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`} 
                />
                <span>{player.name}</span>
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
