
import { Player } from "@/types/player";

interface PlayerCardProps {
  player: Player & { 
    totalWins?: number; 
    gamesPlayed?: number; 
  };
}

export function PlayerCard({ player }: PlayerCardProps) {
  const totalWins = player.totalWins ?? ((player.wins ?? 0) - (player.losses ?? 0));
  const gamesPlayed = player.gamesPlayed ?? ((player.wins ?? 0) + (player.losses ?? 0));

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            player.gender === "male" ? "bg-blue-500" : "bg-pink-500"
          }`}
        />
        <div>
          <p className="font-medium text-gray-900">{player.name}</p>
          {player.isGuest && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
              Guest
            </span>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-bold text-lg text-gray-900">
          {totalWins > 0 ? '+' : ''}{totalWins}
        </div>
        <div className="text-xs text-gray-500">
          {player.wins ?? 0}W - {player.losses ?? 0}L ({gamesPlayed} games)
        </div>
      </div>
    </div>
  );
}
