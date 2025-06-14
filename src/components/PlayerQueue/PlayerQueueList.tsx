import React from "react";
import { Separator } from "@/components/ui/separator";
import { Player } from "@/types/player";
import { PlayerQueueCard } from "./PlayerQueueCard";
import { PiggybackPair } from "@/hooks/usePiggybackPairs";

interface PlayerQueueListProps {
  players: Player[];
  selected: Player[];
  onPlayerSelect: (player: Player) => void;
  onPlayerLeave: (playerId: number, e: React.MouseEvent) => void;
  isNextGameReady: boolean;
  playerPoolSize: number;
  scoreKeepingEnabled: boolean;
  preferencesEnabled: boolean;
  piggybackPairs: PiggybackPair[];
  onOpenPiggybackModal?: (player: Player) => void;
  removePiggybackPair?: (masterId: number) => void;
  findPiggybackPair: (playerId: number) => PiggybackPair | undefined;
  setPiggybackManualWarningShown?: (b: boolean) => void;
}

export function PlayerQueueList({
  players,
  selected,
  onPlayerSelect,
  onPlayerLeave,
  isNextGameReady,
  playerPoolSize,
  scoreKeepingEnabled,
  preferencesEnabled,
  piggybackPairs,
  onOpenPiggybackModal,
  removePiggybackPair,
  findPiggybackPair,
  setPiggybackManualWarningShown,
}: PlayerQueueListProps) {
  return (
    <div className="space-y-2 pr-4">
      {players.map((player, index) => (
        <div key={player.id}>
          {index === playerPoolSize && players.length > playerPoolSize && (
            <div className="relative my-4">
              <Separator className="absolute inset-0 my-2" />
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-muted-foreground">
                  Player Pool Limit
                </span>
              </div>
            </div>
          )}
          <PlayerQueueCard
            player={player}
            selected={selected.some(p => p.id === player.id)}
            isNextGameReady={isNextGameReady}
            scoreKeepingEnabled={scoreKeepingEnabled}
            preferencesEnabled={preferencesEnabled}
            piggybackPairs={piggybackPairs}
            onOpenPiggybackModal={onOpenPiggybackModal}
            removePiggybackPair={removePiggybackPair}
            findPiggybackPair={findPiggybackPair}
            onPlayerSelect={onPlayerSelect}
            onPlayerLeave={onPlayerLeave}
            setPiggybackManualWarningShown={setPiggybackManualWarningShown}
          />
        </div>
      ))}
    </div>
  );
}
