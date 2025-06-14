
import React from "react";
import { CircleDot, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/player";
import { PlayPreference } from "@/types/member";

interface PlayerQueueCardProps {
  player: Player;
  selected: boolean;
  isNextGameReady: boolean;
  scoreKeepingEnabled: boolean;
  preferencesEnabled: boolean;
  piggybackPair: number[];
  togglePiggybackPlayer?: (playerId: number) => void;
  onPlayerSelect: (player: Player) => void;
  onPlayerLeave: (playerId: number, e: React.MouseEvent) => void;
  setPiggybackManualWarningShown?: (b: boolean) => void;
}

export function PlayerQueueCard({
  player,
  selected,
  isNextGameReady,
  scoreKeepingEnabled,
  preferencesEnabled,
  piggybackPair,
  togglePiggybackPlayer,
  onPlayerSelect,
  onPlayerLeave,
  setPiggybackManualWarningShown
}: PlayerQueueCardProps) {
  // For debugging: see what props we get
  React.useEffect(() => {
    console.log("PlayerQueueCard", player.name, "piggybackPair", piggybackPair);
  }, [piggybackPair, player.name]);
  return (
    <div
      className={`border rounded-lg p-3 flex items-center justify-between ${
        isNextGameReady 
          ? "opacity-60 cursor-not-allowed" 
          : "cursor-pointer"
      } ${
        selected
          ? "bg-shuttle-lightBlue border-shuttle-blue"
          : isNextGameReady
            ? ""
            : "hover:bg-gray-50"
      }`}
      onClick={() => onPlayerSelect(player)}
    >
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <CircleDot className={player.gender === 'male' ? 'text-blue-500' : 'text-pink-500'} size={16} />
        <span className="font-medium truncate max-w-[100px]">{player.name}</span>
        {player.isGuest && (
          <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
        )}
        {/* PIGGYBACK ICON */}
        {piggybackPair.includes(player.id) && (
          <span title="Piggybacked" className="ml-1 flex items-center text-xs font-semibold text-purple-700 bg-purple-100 border border-purple-200 px-1 py-0.5 rounded gap-1">
            <Users className="w-4 h-4 inline-block text-purple-700" /> Piggyback
          </span>
        )}
        {/* (Optionally add play preferences and scores here as before) */}
        {scoreKeepingEnabled && (
          <span className="ml-1 text-sm text-gray-500 flex items-center gap-1">
            W {player.sessionWins || 0} – L {player.sessionLosses || 0}
            {selected && (
              <span className="ml-2 h-5 w-5 rounded-full bg-shuttle-blue flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </span>
            )}
          </span>
        )}
        {(!scoreKeepingEnabled && selected) && (
          <span className="ml-1 h-5 w-5 rounded-full bg-shuttle-blue flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </span>
        )}
        {preferencesEnabled && player.playPreferences && player.playPreferences.length > 0 && (
          <div className="flex gap-1 ml-2">
            {player.playPreferences.map((pref) => (
              <Badge key={pref} variant="outline" className="text-xs">
                {pref}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        {togglePiggybackPlayer && (
          <Button
            variant={piggybackPair.includes(player.id) ? "secondary" : "ghost"}
            size="sm"
            className={piggybackPair.includes(player.id) ? "bg-purple-100 text-purple-700" : "hover:bg-purple-50 hover:text-purple-700"}
            onClick={e => {
              e.stopPropagation();
              console.log("Piggyback button clicked for", player.id, player.name);
              togglePiggybackPlayer(player.id);
              setPiggybackManualWarningShown && setPiggybackManualWarningShown(false);
            }}
          >
            {piggybackPair.includes(player.id) ? "Unpiggyback" : piggybackPair.length < 2 ? "Piggyback" : "Swap Piggyback"}
            <Users className="w-4 h-4 ml-1" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
          onClick={e => onPlayerLeave(player.id, e)}
        >
          Leave
        </Button>
      </div>
    </div>
  );
}
