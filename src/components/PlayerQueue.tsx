import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AddPlayerButton } from "@/components/AddPlayerButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { isScoreKeepingEnabled, getStorageItem } from "@/utils/storageUtils";
import { PlayPreference } from "@/types/member";
import { Player } from "@/types/player";
import { PlayerQueueList } from "./PlayerQueue/PlayerQueueList";
import { PiggybackNotice } from "./PlayerQueue/PiggybackNotice";
import { PiggybackModal } from "./PlayerQueue/PiggybackModal";
import { PiggybackPair } from "@/hooks/usePiggybackPairs";

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

export function PlayerQueue({
  players,
  onPlayerSelect,
  onPlayerLeave,
  onAddPlayer,
  isNextGameReady = false,
  piggybackPairs = [],
  addPiggybackPair,
  removePiggybackPair,
  findPiggybackPair,
  clearPiggybackPairs
}: any) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Player[]>([]);
  const scoreKeepingEnabled = isScoreKeepingEnabled();
  const [preferencesEnabled, setPreferencesEnabled] = useState(false);

  // State for leave confirmation dialog
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [playerToLeave, setPlayerToLeave] = useState<number | null>(null);

  // Get player pool size from localStorage or default to 8
  const playerPoolSize = Number(localStorage.getItem("playerPoolSize")) || 8;

  // Load preferences setting
  useEffect(() => {
    const enablePref = getStorageItem("enablePlayerPreferences", false);
    setPreferencesEnabled(enablePref);
  }, []);

  // Ensure selected players are still in the queue
  useEffect(() => {
    if (selected.length > 0) {
      const currentPlayerIds = players.map(player => player.id);
      const updatedSelection = selected.filter(player => 
        currentPlayerIds.includes(player.id)
      );

      if (updatedSelection.length !== selected.length) {
        setSelected(updatedSelection);
      }
    }
  }, [players, selected]);

  // Clear selection when next game becomes ready
  useEffect(() => {
    if (isNextGameReady && selected.length > 0) {
      setSelected([]);
    }
  }, [isNextGameReady, selected.length]);

  // Piggyback recommend warning for manual selection
  const [piggybackManualWarningShown, setPiggybackManualWarningShown] = useState(false);

  const togglePlayerSelection = (player: Player) => {
    // Prevent selection if next game is already ready
    if (isNextGameReady) {
      return;
    }
    if (selected.some(p => p.id === player.id)) {
      setSelected(selected.filter(p => p.id !== player.id));
    } else if (selected.length < 4) {
      setSelected([...selected, player]);
    }
  };

  const handleAddPlayer = (player: {name: string, gender: "male" | "female", isGuest: boolean, playPreferences: PlayPreference[]}) => {
    if (onAddPlayer) {
      onAddPlayer(player);
    }
  };

  const handleManualCreateGame = () => {
    // Show nudge if the selection does NOT include (both) piggybacked players
    const selectedIds = selected.map(p => p.id);
    if (
      piggybackPairs.length === 2 &&
      (!selectedIds.includes(piggybackPairs[0].master) || !selectedIds.includes(piggybackPairs[0].partner))
    ) {
      if (!piggybackManualWarningShown) {
        toast({
          title: "Piggyback Pair Suggestion",
          description:
            "There is a piggyback pair set! Consider including both piggybacked players in the same game.",
          variant: "default"
        });
        setPiggybackManualWarningShown(true);
        // Still allow manual selection
      }
    }
    onPlayerSelect(selected);
    setSelected([]);
  };

  const openLeaveConfirmation = (playerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayerToLeave(playerId);
    setLeaveDialogOpen(true);
  };

  const confirmPlayerLeave = () => {
    if (playerToLeave !== null && onPlayerLeave) {
      // Remove from selection if present
      setSelected(selected.filter(p => p.id !== playerToLeave));
      // Check for piggyback pair and remove if this player is involved
      if (findPiggybackPair && removePiggybackPair) {
        const pair = findPiggybackPair(playerToLeave);
        if (pair) {
          // Remove the piggyback pair by master ID
          removePiggybackPair(pair.master);
        }
      }
      // Call the provided onPlayerLeave callback
      onPlayerLeave(playerToLeave);
      // Reset the state
      setPlayerToLeave(null);
    }
    setLeaveDialogOpen(false);
  };

  const cancelPlayerLeave = () => {
    setPlayerToLeave(null);
    setLeaveDialogOpen(false);
  };

  // Piggyback modal state
  const [piggybackModalOpen, setPiggybackModalOpen] = useState(false);
  const [piggybackMaster, setPiggybackMaster] = useState<Player | null>(null);

  // Open piggyback modal for the chosen master
  const handleOpenPiggybackModal = (player: Player) => {
    setPiggybackMaster(player);
    setPiggybackModalOpen(true);
  };
  const handleClosePiggybackModal = () => {
    setPiggybackModalOpen(false);
    setPiggybackMaster(null);
  };

  // Get available candidates (not already in a pair, not self)
  const getPiggybackCandidates = () => {
    if (!piggybackMaster) return [];
    const pairedIds = new Set(piggybackPairs.flatMap(p => [p.master, p.partner]));
    return players.filter(p =>
      p.id !== piggybackMaster.id && !pairedIds.has(p.id)
    );
  };

  const handlePiggybackPartnerConfirm = (partnerId: number) => {
    if (piggybackMaster) {
      addPiggybackPair(piggybackMaster.id, partnerId);
    }
    handleClosePiggybackModal();
  };

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

      {/* Error message when next game is ready */}
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
            piggybackPairs={piggybackPairs}
            onOpenPiggybackModal={handleOpenPiggybackModal}
            removePiggybackPair={removePiggybackPair}
            findPiggybackPair={findPiggybackPair}
            setPiggybackManualWarningShown={setPiggybackManualWarningShown}
          />
        </ScrollArea>
      )}

      {/* Piggyback modal */}
      <PiggybackModal
        open={piggybackModalOpen}
        onClose={handleClosePiggybackModal}
        candidates={getPiggybackCandidates()}
        onConfirm={handlePiggybackPartnerConfirm}
      />

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this player from the queue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelPlayerLeave}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPlayerLeave}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* If piggybackPair.length === 2, show piggyback notice */}
      {piggybackPairs.length === 2 && clearPiggybackPairs && (
        <PiggybackNotice clearPiggyback={clearPiggybackPairs} />
      )}
    </div>
  );
}
