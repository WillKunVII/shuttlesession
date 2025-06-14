
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayerRankings } from "./PlayerOfSession/PlayerRankings";
import { useAllTimePlayerRankings } from "@/hooks/useAllTimePlayerRankings";
import { gameHistoryDB } from "@/utils/indexedDbUtils";

interface PlayerOfMonthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerOfMonthDialog({ isOpen, onClose }: PlayerOfMonthDialogProps) {
  const { topPlayers, hasScores } = useAllTimePlayerRankings(isOpen);
  const [resetting, setResetting] = useState(false);

  const handleClose = async () => {
    setResetting(true);
    await gameHistoryDB.clearAllPlayerStats();
    setResetting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen && hasScores} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl sm:text-2xl md:text-3xl">
            Player of the Month
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            All-time win rate leaderboard (players with 3+ games)
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-6 text-sm sm:text-base">
          <PlayerRankings topPlayers={topPlayers} />
        </div>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full text-sm sm:text-base" disabled={resetting}>
            Close &amp; Reset All-Time Scores
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
