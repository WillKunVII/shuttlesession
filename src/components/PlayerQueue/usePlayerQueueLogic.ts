import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isScoreKeepingEnabled, getStorageItem } from "@/utils/storageUtils";
import { PlayPreference } from "@/types/member";
import { Player } from "@/types/player";
import { PiggybackPair } from "@/hooks/usePiggybackPairs";

export function usePlayerQueueLogic({
  players,
  isNextGameReady = false,
  onAddPlayer,
  onPlayerSelect,
  onPlayerLeave,
  piggybackPairs = [],
  addPiggybackPair,
  removePiggybackPair,
  findPiggybackPair,
  clearPiggybackPairs
}: any) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Player[]>([]);
  const [preferencesEnabled, setPreferencesEnabled] = useState(false);

  // Leave dialog state
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [playerToLeave, setPlayerToLeave] = useState<number | null>(null);

  // Pool size and score keeping
  const scoreKeepingEnabled = isScoreKeepingEnabled();
  const playerPoolSize = Number(localStorage.getItem("playerPoolSize")) || 8;

  useEffect(() => {
    const enablePref = getStorageItem("enablePlayerPreferences", false);
    setPreferencesEnabled(enablePref);
  }, []);

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

  useEffect(() => {
    if (isNextGameReady && selected.length > 0) {
      setSelected([]);
    }
  }, [isNextGameReady, selected.length]);

  // Piggyback manual warning dialog
  const [piggybackManualWarningShown, setPiggybackManualWarningShown] = useState(false);

  const togglePlayerSelection = (player: Player) => {
    if (isNextGameReady) return;
    // Don't allow selection of resting players
    if (player.isResting) return;
    
    if (selected.some(p => p.id === player.id)) {
      setSelected(selected.filter(p => p.id !== player.id));
    } else if (selected.length < 4) {
      setSelected([...selected, player]);
    }
  };

  const handleAddPlayer = (player: {name: string, gender: "male" | "female", isGuest: boolean, playPreferences: PlayPreference[]}) => {
    if (onAddPlayer) onAddPlayer(player);
  };

  const handleManualCreateGame = () => {
    const selectedIds = selected.map(p => p.id);
    if (
      piggybackPairs.length === 2 &&
      (!selectedIds.includes(piggybackPairs[0].master) || !selectedIds.includes(piggybackPairs[0].partner))
    ) {
      if (!piggybackManualWarningShown) {
        toast({
          title: "Piggyback Pair Suggestion",
          description: "There is a piggyback pair set! Consider including both piggybacked players in the same game.",
          variant: "default"
        });
        setPiggybackManualWarningShown(true);
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
      setSelected(selected.filter(p => p.id !== playerToLeave));
      // Remove piggyback status for this player if they are part of a pair
      if (findPiggybackPair && removePiggybackPair) {
        const pair = findPiggybackPair(playerToLeave);
        if (pair) {
          removePiggybackPair(pair.master);
        }
      }
      onPlayerLeave(playerToLeave);
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

  const handleOpenPiggybackModal = (player: Player) => {
    setPiggybackMaster(player);
    setPiggybackModalOpen(true);
  };
  const handleClosePiggybackModal = () => {
    setPiggybackModalOpen(false);
    setPiggybackMaster(null);
  };

  // Get available piggyback candidates
  const getPiggybackCandidates = () => {
    if (!piggybackMaster) return [];
    const pairedIds = new Set(piggybackPairs.flatMap(p => [p.master, p.partner]));
    return players.filter(p =>
      p.id !== piggybackMaster.id && !pairedIds.has(p.id)
    );
  };

  const handlePiggybackPartnerConfirm = (partnerId: number) => {
    if (piggybackMaster && addPiggybackPair) {
      addPiggybackPair(piggybackMaster.id, partnerId);
    }
    handleClosePiggybackModal();
  };

  return {
    selected,
    setSelected,
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
    piggybackMaster,
    handleOpenPiggybackModal,
    handleClosePiggybackModal,
    getPiggybackCandidates,
    handlePiggybackPartnerConfirm
  };
}
