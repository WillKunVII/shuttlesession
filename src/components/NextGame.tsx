
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Player {
  id: number;
  name: string;
  skill: string;
  waitingTime: number;
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
              <div key={player.id} className="border rounded-lg p-3 flex items-center justify-between">
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
