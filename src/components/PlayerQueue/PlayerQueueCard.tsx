
import React from "react";
import { CircleDot, Users, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/player";
import { PiggybackPair } from "@/hooks/usePiggybackPairs";
import { getPiggybackEnabled } from "@/utils/storageUtils";
import { PlayerActionsMenu } from "./PlayerActionsMenu";

interface PlayerQueueCardProps {
  player: Player;
  players: Player[];
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
  onToggleRest: (playerId: number) => void;
  setPiggybackManualWarningShown?: (b: boolean) => void;
  queuePosition: number;
}

export function PlayerQueueCard({
  player,
  players,
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
  onToggleRest,
  setPiggybackManualWarningShown,
  queuePosition
}: PlayerQueueCardProps) {
  // Find piggyback data for this player (if any)
  const piggybackEnabled = getPiggybackEnabled();
  const pair = piggybackEnabled && findPiggybackPair ? findPiggybackPair(player.id) : undefined;
  const isMaster = pair?.master === player.id;
  const isPartner = pair?.partner === player.id;
  const partnerId = isMaster ? pair?.partner : isPartner ? pair?.master : undefined;
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
      } ${
        player.isResting ? "opacity-75 bg-gray-50" : ""
      }`}
      onClick={() => onPlayerSelect(player)}
    >
      <div className="flex items-center gap-3 flex-wrap min-w-0">
        {/* Queue Position Number */}
        <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700">
          {queuePosition}
        </div>
        <CircleDot className={player.gender === 'male' ? 'text-blue-500' : 'text-pink-500'} size={16} />
        {player.isResting && (
          <Pause className="text-gray-500" size={16} />
        )}
        <span className="font-medium truncate max-w-[100px]">{player.name}</span>
        {player.isGuest && (
          <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
        )}
        {player.isResting && (
          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-300">
            Resting
          </Badge>
        )}
        {/* PIGGYBACK BADGE */}
        {piggybackEnabled && pair && partnerId !== undefined && (
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
      
      {/* Player Actions Menu */}
      <div className="flex-shrink-0">
        <PlayerActionsMenu
          player={player}
          piggybackPairs={piggybackPairs}
          findPiggybackPair={findPiggybackPair}
          onToggleRest={onToggleRest}
          onOpenPiggybackModal={onOpenPiggybackModal}
          onRemovePiggybackPair={removePiggybackPair}
          onPlayerLeave={onPlayerLeave}
          setPiggybackManualWarningShown={setPiggybackManualWarningShown}
        />
      </div>
    </div>
  );
}
