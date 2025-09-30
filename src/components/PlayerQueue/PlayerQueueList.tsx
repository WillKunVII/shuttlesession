
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Player } from "@/types/player";
import { PlayerQueueCard } from "./PlayerQueueCard";
import { PiggybackPair } from "@/hooks/usePiggybackPairs";
import { getPiggybackEnabled } from "@/utils/storageUtils";

interface PlayerQueueListProps {
  players: Player[];
  selected: Player[];
  onPlayerSelect: (player: Player) => void;
  onPlayerLeave: (playerId: number, e: React.MouseEvent) => void;
  onToggleRest: (playerId: number) => void;
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
  onToggleRest,
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
  const piggybackEnabled = getPiggybackEnabled();
  
  // Calculate dynamic pool boundary - find the Nth active player
  const activePlayers = players.filter(p => !p.isResting);
  const activePoolCount = Math.min(playerPoolSize, activePlayers.length);
  
  // Find the index of the last active player in the pool
  let activeCount = 0;
  let poolBoundaryIndex = -1;
  for (let i = 0; i < players.length; i++) {
    if (!players[i].isResting) {
      activeCount++;
      if (activeCount === activePoolCount) {
        poolBoundaryIndex = i;
        break;
      }
    }
  }
  
  // Separate players into sections
  const restingPlayers: Player[] = [];
  const activePoolPlayers: Player[] = [];
  const waitingPlayers: Player[] = [];
  
  players.forEach((player, index) => {
    if (player.isResting) {
      restingPlayers.push(player);
    } else if (poolBoundaryIndex !== -1 && index <= poolBoundaryIndex) {
      activePoolPlayers.push(player);
    } else {
      waitingPlayers.push(player);
    }
  });

  return (
    <div className="space-y-2 pr-4">
      {/* Active Pool Section */}
      {activePoolPlayers.length > 0 && (
        <>
          <div className="px-2 py-1">
            <span className="text-xs font-medium text-primary">
              Active Pool ({activePoolPlayers.length} of {playerPoolSize})
            </span>
          </div>
          {activePoolPlayers.map((player) => {
            const originalIndex = players.findIndex(p => p.id === player.id);
            return (
              <PlayerQueueCard
                key={`player-${player.id}-${originalIndex}`}
                player={player}
                players={players}
                selected={selected.some((p: any) => p.id === player.id)}
                isNextGameReady={isNextGameReady}
                scoreKeepingEnabled={scoreKeepingEnabled}
                preferencesEnabled={preferencesEnabled}
                piggybackPairs={piggybackEnabled ? piggybackPairs : []}
                onOpenPiggybackModal={piggybackEnabled ? onOpenPiggybackModal : undefined}
                removePiggybackPair={piggybackEnabled ? removePiggybackPair : undefined}
                findPiggybackPair={piggybackEnabled ? findPiggybackPair : () => undefined}
                onPlayerSelect={onPlayerSelect}
                onPlayerLeave={onPlayerLeave}
                onToggleRest={onToggleRest}
                setPiggybackManualWarningShown={piggybackEnabled ? setPiggybackManualWarningShown : undefined}
                queuePosition={originalIndex + 1}
              />
            );
          })}
        </>
      )}

      {/* Separator between pool and resting/waiting */}
      {activePoolPlayers.length > 0 && (restingPlayers.length > 0 || waitingPlayers.length > 0) && (
        <div className="relative my-4">
          <Separator className="absolute inset-0 my-2" />
          <div className="relative flex justify-center">
            <span className="bg-background px-2 text-xs text-muted-foreground">
              Player Pool Limit
            </span>
          </div>
        </div>
      )}

      {/* Resting Players Section */}
      {restingPlayers.length > 0 && (
        <>
          <div className="px-2 py-1">
            <span className="text-xs font-medium text-orange-600">
              Resting ({restingPlayers.length})
            </span>
          </div>
          {restingPlayers.map((player) => {
            const originalIndex = players.findIndex(p => p.id === player.id);
            return (
              <PlayerQueueCard
                key={`player-${player.id}-${originalIndex}`}
                player={player}
                players={players}
                selected={selected.some((p: any) => p.id === player.id)}
                isNextGameReady={isNextGameReady}
                scoreKeepingEnabled={scoreKeepingEnabled}
                preferencesEnabled={preferencesEnabled}
                piggybackPairs={piggybackEnabled ? piggybackPairs : []}
                onOpenPiggybackModal={piggybackEnabled ? onOpenPiggybackModal : undefined}
                removePiggybackPair={piggybackEnabled ? removePiggybackPair : undefined}
                findPiggybackPair={piggybackEnabled ? findPiggybackPair : () => undefined}
                onPlayerSelect={onPlayerSelect}
                onPlayerLeave={onPlayerLeave}
                onToggleRest={onToggleRest}
                setPiggybackManualWarningShown={piggybackEnabled ? setPiggybackManualWarningShown : undefined}
                queuePosition={originalIndex + 1}
              />
            );
          })}
        </>
      )}

      {/* Waiting Queue Section */}
      {waitingPlayers.length > 0 && (
        <>
          <div className="px-2 py-1">
            <span className="text-xs font-medium text-muted-foreground">
              Waiting Queue ({waitingPlayers.length})
            </span>
          </div>
          {waitingPlayers.map((player) => {
            const originalIndex = players.findIndex(p => p.id === player.id);
            return (
              <PlayerQueueCard
                key={`player-${player.id}-${originalIndex}`}
                player={player}
                players={players}
                selected={selected.some((p: any) => p.id === player.id)}
                isNextGameReady={isNextGameReady}
                scoreKeepingEnabled={scoreKeepingEnabled}
                preferencesEnabled={preferencesEnabled}
                piggybackPairs={piggybackEnabled ? piggybackPairs : []}
                onOpenPiggybackModal={piggybackEnabled ? onOpenPiggybackModal : undefined}
                removePiggybackPair={piggybackEnabled ? removePiggybackPair : undefined}
                findPiggybackPair={piggybackEnabled ? findPiggybackPair : () => undefined}
                onPlayerSelect={onPlayerSelect}
                onPlayerLeave={onPlayerLeave}
                onToggleRest={onToggleRest}
                setPiggybackManualWarningShown={piggybackEnabled ? setPiggybackManualWarningShown : undefined}
                queuePosition={originalIndex + 1}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
