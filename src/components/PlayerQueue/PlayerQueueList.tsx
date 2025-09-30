
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
  
  // Calculate total active (non-resting) players
  const totalActiveCount = players.filter(p => !p.isResting).length;
  
  // Determine if we need to split the queue
  const needsSplit = totalActiveCount > playerPoolSize;
  
  let activePoolPlayers: Player[] = [];
  let waitingPlayers: Player[] = [];
  
  if (needsSplit) {
    // Find the Nth active player to determine pool boundary
    let activeCount = 0;
    let poolBoundaryIndex = -1;
    
    for (let i = 0; i < players.length; i++) {
      if (!players[i].isResting) {
        activeCount++;
        if (activeCount === playerPoolSize) {
          poolBoundaryIndex = i;
          break;
        }
      }
    }
    
    // Split at boundary
    players.forEach((player, index) => {
      if (!player.isResting && poolBoundaryIndex !== -1 && index <= poolBoundaryIndex) {
        activePoolPlayers.push(player);
      } else {
        waitingPlayers.push(player);
      }
    });
  } else {
    // All players stay in active pool when total active players ≤ pool limit
    activePoolPlayers = players;
  }

  return (
    <div className="space-y-2 pr-4">
      {/* Active Pool Section - Always visible */}
      <div className="px-2 py-1">
        <span className="text-xs font-medium text-primary">
          Active Pool ({Math.min(totalActiveCount, playerPoolSize)} of {playerPoolSize})
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

      {/* Separator between pool and waiting - only show when there's a waiting queue */}
      {waitingPlayers.length > 0 && (
        <div className="relative my-4">
          <Separator className="absolute inset-0 my-2" />
          <div className="relative flex justify-center">
            <span className="bg-background px-2 text-xs text-muted-foreground">
              Player Pool Limit
            </span>
          </div>
        </div>
      )}

      {/* Waiting Queue Section - only show when players exceed pool limit */}
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
