
import { Player } from "@/types/player";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="flex items-center justify-between border rounded-lg p-3">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
        {/* Upgrade player name font-size from default to text-base (16px) */}
        <span className="font-medium text-base">{player.name}</span>
        {player.isGuest && (
          <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
        )}
      </div>
      <div className="text-sm">
        W {player.wins || 0} – L {player.losses || 0}
      </div>
    </div>
  );
}

