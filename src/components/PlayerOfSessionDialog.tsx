
import { useState, useEffect } from "react";
import { getStorageItem } from "@/utils/storageUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayerRankings } from "./PlayerOfSession/PlayerRankings";
import { useSessionScores } from "@/hooks/useSessionScores";

interface PlayerOfSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerOfSessionDialog({ isOpen, onClose }: PlayerOfSessionDialogProps) {
  const { topPlayers, hasScores } = useSessionScores(isOpen);

  return (
    <Dialog open={isOpen && hasScores} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl sm:text-2xl md:text-3xl">Player of the Session</DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            Congratulations to our top players of this session!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6 text-sm sm:text-base">
          <PlayerRankings topPlayers={topPlayers} />
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full text-sm sm:text-base">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
