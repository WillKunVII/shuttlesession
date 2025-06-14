import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PlayPreference } from "@/types/member";
import { CheckCircle } from "lucide-react";
import { PlayerCardSmall } from "./PlayerCardSmall";

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
  
  const isGameReady = safePlayers.length === 4;
  
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
  
  return (
    <div className={`border rounded-lg p-3 transition-all duration-300 ${
      isGameReady 
        ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200' 
        : 'border-gray-200'
    }`}>
      {safePlayers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No game ready. Select players from the queue.
        </div>
      ) : (
        <>
          {isGameReady && (
            <div className="mb-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold text-green-800">
                  Next Game Ready!
                </span>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium border border-green-200">
                {gameType} Game
              </span>
            </div>
          )}
          
          {!isGameReady && safePlayers.length > 0 && (
            <div className="mb-3 text-center">
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                {safePlayers.length}/4 Players Selected
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {/* Team 1 (Left Column) */}
            <div className="space-y-2">
              {sortedPlayers.team1.map(player => (
                <PlayerCardSmall
                  key={player.id}
                  player={player}
                  highlight={isGameReady}
                />
              ))}
            </div>
            
            {/* Team 2 (Right Column) */}
            <div className="space-y-2">
              {sortedPlayers.team2.map(player => (
                <PlayerCardSmall
                  key={player.id}
                  player={player}
                  highlight={isGameReady}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-right">
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear Selection
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
