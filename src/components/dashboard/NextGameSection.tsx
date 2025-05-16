
import { Button } from "@/components/ui/button";
import { NextGame } from "@/components/NextGame";
import { Player } from "@/types/playerTypes";

interface NextGameSectionProps {
  nextGamePlayers: Player[];
  handleClearNextGame: () => void;
  generateNextGame: () => void;
  queueLength: number;
}

export function NextGameSection({ 
  nextGamePlayers, 
  handleClearNextGame, 
  generateNextGame, 
  queueLength 
}: NextGameSectionProps) {
  console.log("NextGameSection rendering with queue length:", queueLength);
  
  // Calculate button disabled state based on current conditions
  const autoSelectDisabled = nextGamePlayers.length > 0 || queueLength < 4;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Next Game</h2>
        <Button 
          variant="outline" 
          onClick={generateNextGame} 
          disabled={autoSelectDisabled} 
          size="sm"
        >
          Auto-Select Players {queueLength >= 4 ? `(${queueLength})` : ''}
        </Button>
      </div>
      <NextGame players={nextGamePlayers} onClear={handleClearNextGame} />
    </div>
  );
}
