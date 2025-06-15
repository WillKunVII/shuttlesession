import React from "react";
import { CircleDot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/player";
import { PiggybackPair } from "@/hooks/usePiggybackPairs";

interface PlayerQueueCardProps {
  player: Player;
  players: Player[]; // new: all players in queue
  selected: boolean;
  isNextGameReady: boolean;
  scoreKeepingEnabled: boolean;
  preferencesEnabled: boolean;
  piggybackPairs: PiggybackPair[];
  onOpenPiggybackModal?: (player: Player) => void;
  removePiggybackPair?: (masterId: number) => void;
  findPiggybackPair: (playerId: number) => PiggybackPair | undefined;
  onPlayerSelect: (player: Player) => void;
  onPlayerLeave: (playerId: number, e: React.MouseEvent) => void;
  setPiggybackManualWarningShown?: (b: boolean) => void;
}

export function PlayerQueueCard({
  player,
  players, // now available
  selected,
  isNextGameReady,
  scoreKeepingEnabled,
  preferencesEnabled,
  piggybackPairs,
  onOpenPiggybackModal,
  removePiggybackPair,
  findPiggybackPair,
  onPlayerSelect,
  onPlayerLeave,
  setPiggybackManualWarningShown
}: PlayerQueueCardProps) {
  // Find piggyback data for this player (if any)
  const pair = findPiggybackPair(player.id);
  const isMaster = pair?.master === player.id;
  const isPartner = pair?.partner === player.id;
  const partnerId = isMaster ? pair?.partner : isPartner ? pair?.master : undefined;

  // Find partner/master name, if exists in queue
  const partnerPlayer = players.find(p => p.id === partnerId);
  const partnerName = partnerPlayer ? partnerPlayer.name : "Unknown";

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
        {/* PIGGYBACK BADGE */}
        {pair && partnerId !== undefined && (
          <span
            title="Piggybacked"
            className="ml-1 flex items-center text-xs font-semibold text-purple-700 bg-purple-100 border border-purple-200 px-1 py-0.5 rounded gap-1"
          >
            <Users className="w-4 h-4 inline-block text-purple-700" />
            <span>
              {isMaster ? "( " : ""}
              {isMaster ? "Partner: " : "With: "}
              <span className="font-bold">{partnerName}</span>
              {isMaster ? " )" : ""}
            </span>
          </span>
        )}
        {/* (Optionally add play preferences and scores) */}
        {scoreKeepingEnabled && (
          <span className="ml-1 text-sm text-gray-500 flex items-center gap-1">
            W {player.sessionWins || 0} – L {player.sessionLosses || 0}
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
      {/* Responsive action buttons */}
      <div
        className="
          flex 
          flex-row gap-2 ml-4
          md:flex-col md:gap-3 md:w-28
        "
      >
        {/* Only show button if not already in a pair */}
        {!pair && onOpenPiggybackModal && (
          <Button
            variant="ghost"
            size="sm"
            className="
              hover:bg-purple-50 hover:text-purple-700
              md:w-full
              min-h-[40px]
            "
            onClick={e => {
              e.stopPropagation();
              onOpenPiggybackModal(player);
              setPiggybackManualWarningShown && setPiggybackManualWarningShown(false);
            }}
          >
            Piggyback
            <Users className="w-4 h-4 ml-1" />
          </Button>
        )}
        {/* Only masters can unpiggyback */}
        {isMaster && removePiggybackPair && (
          <Button
            variant="secondary"
            size="sm"
            className="
              bg-purple-100 text-purple-700
              md:w-full
              min-h-[40px]
            "
            onClick={e => {
              e.stopPropagation();
              removePiggybackPair(player.id);
            }}
          >
            Unpiggyback
            <Users className="w-4 h-4 ml-1" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="
            text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto
            md:w-full
            min-h-[40px]
          "
          onClick={e => onPlayerLeave(player.id, e)}
        >
          Leave
        </Button>
      </div>
    </div>
  );
}
