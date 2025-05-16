import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PlayPreference } from "@/types/member";
interface Player {
  id: number;
  name: string;
  waitingTime: number;
  gender: "male" | "female";
  isGuest?: boolean;
  playPreferences?: PlayPreference[];
}
interface NextGameProps {
  players: Player[];
  onClear: () => void;
}
export function NextGame({
  players,
  onClear
}: NextGameProps) {
  // Ensure players is always an array
  const safePlayers = Array.isArray(players) ? players : [];
  const [sortedPlayers, setSortedPlayers] = useState<{
    team1: Player[];
    team2: Player[];
  }>({
    team1: [],
    team2: []
  });
  const [gameType, setGameType] = useState<PlayPreference>("Open");
  useEffect(() => {
    if (safePlayers.length === 4) {
      // Determine game type
      const isMixedPossible = safePlayers.filter(p => p.gender === "male").length === 2 && safePlayers.filter(p => p.gender === "female").length === 2;
      const isLadiesPossible = safePlayers.filter(p => p.gender === "female").length === 4;

      // Check preferences
      const allPreferences = safePlayers.flatMap(p => p.playPreferences || []);
      const hasOpenPreference = allPreferences.includes("Open");
      const hasMixedPreference = allPreferences.includes("Mixed");
      const hasLadiesPreference = allPreferences.includes("Ladies");
      let type: PlayPreference = "Open";

      // Priority: Mixed > Ladies > Open
      if (isMixedPossible && hasMixedPreference) {
        type = "Mixed";
      } else if (isLadiesPossible && hasLadiesPreference) {
        type = "Ladies";
      } else {
        type = "Open";
      }
      setGameType(type);

      // Sort players based on game type
      let team1: Player[] = [];
      let team2: Player[] = [];
      if (type === "Mixed") {
        // For mixed games, put one male and one female on each side
        const males = safePlayers.filter(p => p.gender === "male");
        const females = safePlayers.filter(p => p.gender === "female");
        team1 = [males[0], females[0]];
        team2 = [males[1], females[1]];
      } else if (type === "Ladies") {
        // For ladies games, just split the players
        team1 = [safePlayers[0], safePlayers[1]];
        team2 = [safePlayers[2], safePlayers[3]];
      } else {
        // For open games, just split the players
        team1 = [safePlayers[0], safePlayers[1]];
        team2 = [safePlayers[2], safePlayers[3]];
      }
      setSortedPlayers({
        team1,
        team2
      });
    } else {
      setSortedPlayers({
        team1: [],
        team2: []
      });
    }
  }, [safePlayers]);
  return <div className="border rounded-lg p-3">
      {safePlayers.length === 0 ? <div className="text-center py-8 text-muted-foreground">No game ready.
Select players from the queue.</div> : <>
          {safePlayers.length === 4 && <div className="mb-3 text-center">
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                {gameType} Game
              </span>
            </div>}
          
          <div className="grid grid-cols-2 gap-4">
            {/* Team 1 (Left Column) */}
            <div className="space-y-2">
              {sortedPlayers.team1.map(player => <div key={player.id} className="flex items-center gap-2 text-sm py-1 px-3 rounded-full bg-gray-100">
                  <span className={`h-2 w-2 rounded-full ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                  <span>{player.name}</span>
                  {player.isGuest && <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>}
                </div>)}
            </div>
            
            {/* Team 2 (Right Column) */}
            <div className="space-y-2">
              {sortedPlayers.team2.map(player => <div key={player.id} className="flex items-center gap-2 text-sm py-1 px-3 rounded-full bg-gray-100">
                  <span className={`h-2 w-2 rounded-full ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                  <span>{player.name}</span>
                  {player.isGuest && <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>}
                </div>)}
            </div>
          </div>
          
          <div className="mt-4 text-right">
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear Selection
            </Button>
          </div>
        </>}
    </div>;
}