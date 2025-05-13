
import { useState, useEffect, useCallback } from "react";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStorageItem, setStorageItem } from "@/utils/storageUtils";

interface Player {
  name: string;
  gender: "male" | "female";
  isGuest?: boolean;
  id?: number;
}

interface EndGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onSaveResults: (winnerIds: string[]) => void;
}

export function EndGameDialog({ isOpen, onClose, players, onSaveResults }: EndGameDialogProps) {
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
  const isScoreKeepingEnabled = getStorageItem("scoreKeeping", false);
  
  // Reset selections when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedWinners([]);
    }
  }, [isOpen]);
  
  // Toggle player selection as winner, memoized to avoid rerenders
  const toggleWinner = useCallback((playerName: string) => {
    setSelectedWinners(prev => {
      if (prev.includes(playerName)) {
        return prev.filter(name => name !== playerName);
      } else {
        // Only allow 2 winners max
        return prev.length < 2 ? [...prev, playerName] : prev;
      }
    });
  }, []);
  
  const handleSave = useCallback(() => {
    if (!isScoreKeepingEnabled) {
      onClose();
      return;
    }
    
    // Get all members
    const members = getStorageItem("members", []);
    
    // Update wins/losses for all players
    players.forEach(player => {
      // Find if this player is in the members list
      const memberIndex = members.findIndex((m: any) => m.name === player.name);
      const isWinner = selectedWinners.includes(player.name);
      
      if (memberIndex !== -1) {
        // Update existing member
        if (isWinner) {
          members[memberIndex].wins = (members[memberIndex].wins || 0) + 1;
        } else {
          members[memberIndex].losses = (members[memberIndex].losses || 0) + 1;
        }
      } else {
        // Add new member with win/loss record
        members.push({
          name: player.name,
          gender: player.gender,
          isGuest: player.isGuest,
          wins: isWinner ? 1 : 0,
          losses: isWinner ? 0 : 1
        });
      }
    });
    
    // Save updated members data
    setStorageItem("members", members);
    
    // Continue with original save
    onSaveResults(selectedWinners);
    onClose();
  }, [isScoreKeepingEnabled, onClose, onSaveResults, players, selectedWinners]);
  
  // If score keeping is disabled, just skip dialog
  if (!isScoreKeepingEnabled) {
    return null;
  }
  
  return (
    <Dialog open={isOpen && isScoreKeepingEnabled} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Game Results</DialogTitle>
          <DialogDescription>
            Select the two players who won the game. This will update their win/loss record.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {players.map((player) => (
            <div key={player.name} className="flex items-center space-x-3">
              <Checkbox
                id={`winner-${player.name}`}
                checked={selectedWinners.includes(player.name)}
                onCheckedChange={() => toggleWinner(player.name)}
              />
              <label
                htmlFor={`winner-${player.name}`}
                className="flex items-center text-sm font-medium gap-2 cursor-pointer"
              >
                <span className={`h-2 w-2 rounded-full ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                {player.name}
                {selectedWinners.includes(player.name) && (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                )}
              </label>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button 
            disabled={selectedWinners.length !== 2} 
            onClick={handleSave}
          >
            <Trophy className="h-4 w-4 mr-2" /> Save and End Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
