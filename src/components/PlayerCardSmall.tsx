
import React from "react";
import { Player } from "@/types/player";

interface PlayerCardSmallProps {
  player: Pick<Player, "name" | "gender" | "isGuest">;
  highlight?: boolean;
}

export function PlayerCardSmall({ player, highlight = false }: PlayerCardSmallProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm py-2 px-3 rounded-full border transition-colors
        ${highlight 
          ? "bg-green-100 border-green-200 font-medium text-green-800"
          : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
      style={{ minWidth: 0 }}
    >
      <span className={`h-2 w-2 rounded-full ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
      {/* Upgrade player name font-size from text-sm (14px) to text-base (16px) */}
      <span className="truncate text-base">{player.name}</span>
      {player.isGuest && (
        <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
      )}
    </div>
  );
}

