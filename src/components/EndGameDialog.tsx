
import { useState, useEffect } from "react";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getSessionScores, setSessionScores } from "@/utils/storageUtils";
import { updatePlayersElo } from "@/utils/eloUtils";
import { recordGame } from "@/utils/gameUtils";
import { Player } from "@/types/player";

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
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
  const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") !== "false";

  useEffect(() => {
    if (isOpen) {
      setSelectedWinners([]);
    }
  }, [isOpen]);

  const toggleWinner = (playerName: string) => {
    if (selectedWinners.includes(playerName)) {
      setSelectedWinners(selectedWinners.filter((name) => name !== playerName));
    } else {
      if (selectedWinners.length < 2) {
        setSelectedWinners([...selectedWinners, playerName]);
      }
    }
  };

  /**
   * Enhanced save function that records to both localStorage and IndexedDB
   */
  const handleSave = async () => {
    console.log("EndGameDialog: Starting to save game results", { players, selectedWinners });

    // 1. Load the full list of members from localStorage
    const membersData = localStorage.getItem("members");
    let members: any[] = [];
    if (membersData) {
      try {
        members = JSON.parse(membersData);
      } catch (e) {
        console.error("Error parsing members data", e);
      }
    }

    // 2. Session score tracking (localStorage)
    const sessionScores = getSessionScores();

    // 3. ELO calculation and sync
    const prevRatingsLookup: Record<string, number> = {};
    players.forEach((player) => {
      const memberRating =
        members.find((m: any) => m.name === player.name)?.rating ??
        (player.rating ?? 1000);
      prevRatingsLookup[player.name] = memberRating;
    });

    const updated = updatePlayersElo(
      players.map((p) => ({
        name: p.name,
        rating: prevRatingsLookup[p.name],
      })),
      selectedWinners
    );
    for (const upd of updated) {
      const idx = members.findIndex((m: any) => m.name === upd.name);
      if (idx !== -1) members[idx].rating = upd.rating;
    }

    // 4. Update wins/losses for players in the full members array
    players.forEach((player) => {
      const playerName = player.name;
      const isWinner = selectedWinners.includes(playerName);

      // Update session scores
      if (!sessionScores[playerName]) {
        sessionScores[playerName] = { wins: 0, losses: 0 };
      }
      if (isWinner) {
        sessionScores[playerName].wins += 1;
      } else {
        sessionScores[playerName].losses += 1;
      }

      // Update full member record
      const memberIndex = members.findIndex((m) => m.name === playerName);
      if (memberIndex !== -1) {
        if (isWinner) {
          members[memberIndex].wins = (members[memberIndex].wins || 0) + 1;
        } else {
          members[memberIndex].losses = (members[memberIndex].losses || 0) + 1;
        }
        if (typeof player.gender === "string")
          members[memberIndex].gender = player.gender;
        if (typeof player.isGuest === "boolean")
          members[memberIndex].isGuest = player.isGuest;
      } else {
        // Add new if doesn't exist
        members.push({
          id: player.id || Date.now(),
          name: playerName,
          gender: player.gender,
          isGuest: player.isGuest,
          wins: isWinner ? 1 : 0,
          losses: isWinner ? 0 : 1,
          rating: prevRatingsLookup[playerName] || 1000,
        });
      }
    });

    // 5. Save to localStorage
    setSessionScores(sessionScores);
    localStorage.setItem("members", JSON.stringify(members));
    localStorage.setItem("clubMembers", JSON.stringify(members));

    // 6. NEW: Record game to IndexedDB with proper winner IDs
    try {
      // Convert winner names to winner IDs
      const winnerIds = selectedWinners
        .map(winnerName => {
          const player = players.find(p => p.name === winnerName);
          return player?.id;
        })
        .filter((id): id is number => typeof id === "number");

      console.log("EndGameDialog: Recording game to IndexedDB", { 
        playerNames: players.map(p => p.name),
        playerIds: players.map(p => p.id),
        winnerNames: selectedWinners,
        winnerIds 
      });

      // Record the game with full player objects and winner IDs
      await recordGame(players, winnerIds);
      console.log("EndGameDialog: Successfully recorded game to IndexedDB");
    } catch (error) {
      console.error("EndGameDialog: Failed to record game to IndexedDB", error);
      // Don't fail the entire operation if IndexedDB write fails
    }

    // 7. Continue with callback
    onSaveResults(selectedWinners);
    onClose();
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

        <div className="grid gap-2 py-4">
          {players.map((player) => (
            <div
              key={player.name}
              className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-3 transition-colors"
            >
              <Checkbox
                id={`winner-${player.name}`}
                checked={selectedWinners.includes(player.name)}
                onCheckedChange={() => toggleWinner(player.name)}
              />
              <Label
                htmlFor={`winner-${player.name}`}
                className="flex items-center text-sm font-medium gap-2 cursor-pointer flex-1"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    player.gender === "male"
                      ? "bg-blue-500"
                      : "bg-pink-500"
                  }`}
                ></span>
                {player.name}
                {selectedWinners.includes(player.name) && (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                )}
              </Label>
            </div>
          ))}
        </div>

        <SheetFooter className="flex flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            disabled={selectedWinners.length !== 2}
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
