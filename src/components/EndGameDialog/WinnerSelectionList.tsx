
import { Trophy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Player } from "@/types/player";

interface WinnerSelectionListProps {
  players: Player[];
  selectedWinners: string[];
  onToggleWinner: (playerName: string) => void;
}

export function WinnerSelectionList({
  players,
  selectedWinners,
  onToggleWinner,
}: WinnerSelectionListProps) {
  return (
    <div className="grid gap-2 py-4">
      {players.map((player) => (
        <div
          key={player.name}
          className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-3 transition-colors"
        >
          <Checkbox
            id={`winner-${player.name}`}
            checked={selectedWinners.includes(player.name)}
            onCheckedChange={() => onToggleWinner(player.name)}
          />
          <Label
            htmlFor={`winner-${player.name}`}
            className="flex items-center text-sm font-medium gap-2 cursor-pointer flex-1"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                player.gender === "male"
                  ? "bg-blue-500"
                  : "bg-pink-500"
              }`}
            ></span>
            {player.name}
            {selectedWinners.includes(player.name) && (
              <Trophy className="h-4 w-4 text-yellow-500" />
            )}
          </Label>
        </div>
      ))}
    </div>
  );
}
