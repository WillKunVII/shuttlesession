
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Player } from "@/types/player";
import { useWinnerSelection } from "@/hooks/useWinnerSelection";
import { saveGameResults } from "@/utils/gameResultsHandler";
import { WinnerSelectionList } from "./EndGameDialog/WinnerSelectionList";

interface EndGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onSaveResults: (winnerIds: string[]) => void;
}

export function EndGameDialog({
  isOpen,
  onClose,
  players,
  onSaveResults,
}: EndGameDialogProps) {
  const { selectedWinners, toggleWinner, isValidSelection } = useWinnerSelection(isOpen);
  const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") !== "false";

  const handleSave = async () => {
    try {
      await saveGameResults(players, selectedWinners);
      onSaveResults(selectedWinners);
      onClose();
    } catch (error) {
      console.error("EndGameDialog: Error saving game results", error);
      // Still proceed with closing dialog - results handler logs errors internally
      onSaveResults(selectedWinners);
      onClose();
    }
  };

  if (!isScoreKeepingEnabled) {
    return null;
  }

  return (
    <Sheet open={isOpen && isScoreKeepingEnabled} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Record Game Results</SheetTitle>
          <SheetDescription>
            Select the two players who won the game. This will update their win/loss record.
          </SheetDescription>
        </SheetHeader>

        <WinnerSelectionList
          players={players}
          selectedWinners={selectedWinners}
          onToggleWinner={toggleWinner}
        />

        <SheetFooter className="flex flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            disabled={!isValidSelection}
            onClick={handleSave}
            className="flex-1"
          >
            <Trophy className="h-4 w-4 mr-2" /> Save and End Game
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
