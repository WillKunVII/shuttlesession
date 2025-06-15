import React from "react";
import { Button } from "@/components/ui/button";
import { AddPlayerButton } from "@/components/AddPlayerButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayerQueueList } from "./PlayerQueue/PlayerQueueList";
import { PiggybackNotice } from "./PlayerQueue/PiggybackNotice";
import { PiggybackModal } from "./PlayerQueue/PiggybackModal";
import { LeaveConfirmationDialog } from "./PlayerQueue/LeaveConfirmationDialog";
import { usePlayerQueueLogic } from "./PlayerQueue/usePlayerQueueLogic";
import { PiggybackPair } from "@/hooks/usePiggybackPairs";
import { PlayPreference } from "@/types/member";
import { Player } from "@/types/player";
import { getPiggybackEnabled } from "@/utils/storageUtils";

interface PlayerQueueProps {
  players: Player[];
  onPlayerSelect: (selectedPlayers: Player[]) => void;
  onPlayerLeave?: (playerId: number) => void;
  onAddPlayer?: (player: {name: string, gender: "male" | "female", isGuest: boolean, playPreferences: PlayPreference[]}) => void;
  isNextGameReady?: boolean;
  piggybackPairs?: PiggybackPair[];
  addPiggybackPair?: (master: number, partner: number) => void;
  removePiggybackPair?: (master: number) => void;
  findPiggybackPair?: (playerId: number) => PiggybackPair | undefined;
  clearPiggybackPairs?: () => void;
}

export function PlayerQueue(props: any) {
  const {
    selected,
    preferencesEnabled,
    scoreKeepingEnabled,
    playerPoolSize,
    leaveDialogOpen,
    playerToLeave,
    openLeaveConfirmation,
    confirmPlayerLeave,
    cancelPlayerLeave,
    piggybackManualWarningShown,
    setPiggybackManualWarningShown,
    togglePlayerSelection,
    handleAddPlayer,
    handleManualCreateGame,
    piggybackModalOpen,
    handleOpenPiggybackModal,
    handleClosePiggybackModal,
    getPiggybackCandidates,
    handlePiggybackPartnerConfirm
  } = usePlayerQueueLogic(props);

  const {
    players,
    isNextGameReady = false,
    piggybackPairs = [],
    clearPiggybackPairs
  } = props;

  const piggybackEnabled = getPiggybackEnabled();

  return (
    <div className="space-y-4 max-h-[calc(100vh-24rem)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Player Queue</h2>
        <div className="flex gap-2">
          <AddPlayerButton 
            variant="outline" 
            onAddPlayer={handleAddPlayer}
          />
          <Button
            size="sm"
            disabled={selected.length !== 4 || isNextGameReady}
            onClick={handleManualCreateGame}
          >
            Create Game
          </Button>
        </div>
      </div>
      {isNextGameReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            There's already a next game ready. Players cannot be manually selected until the current next game is assigned to a court.
          </p>
        </div>
      )}
      {players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players in queue
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-30rem)]">
          <PlayerQueueList
            players={players}
            selected={selected}
            onPlayerSelect={togglePlayerSelection}
            onPlayerLeave={openLeaveConfirmation}
            isNextGameReady={isNextGameReady}
            playerPoolSize={playerPoolSize}
            scoreKeepingEnabled={scoreKeepingEnabled}
            preferencesEnabled={preferencesEnabled}
            piggybackPairs={piggybackEnabled ? piggybackPairs : []}
            onOpenPiggybackModal={piggybackEnabled ? handleOpenPiggybackModal : undefined}
            removePiggybackPair={piggybackEnabled ? props.removePiggybackPair : undefined}
            findPiggybackPair={piggybackEnabled ? props.findPiggybackPair : () => undefined}
            setPiggybackManualWarningShown={piggybackEnabled ? setPiggybackManualWarningShown : undefined}
          />
        </ScrollArea>
      )}
      {/* Piggyback modal */}
      {piggybackEnabled && (
        <PiggybackModal
          open={piggybackModalOpen}
          onClose={handleClosePiggybackModal}
          candidates={getPiggybackCandidates()}
          onConfirm={handlePiggybackPartnerConfirm}
        />
      )}
      {/* Leave Confirmation Dialog */}
      <LeaveConfirmationDialog
        open={leaveDialogOpen}
        onCancel={cancelPlayerLeave}
        onConfirm={confirmPlayerLeave}
      />
      {(piggybackEnabled && piggybackPairs.length === 2 && clearPiggybackPairs) && (
        <PiggybackNotice clearPiggyback={clearPiggybackPairs} />
      )}
    </div>
  );
}
