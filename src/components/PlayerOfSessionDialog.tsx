
import { useState, useEffect } from "react";
import { Trophy, Medal, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStorageItem } from "@/utils/storageUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Player {
  name: string;
  gender: "male" | "female";
  isGuest?: boolean;
  wins?: number;
  losses?: number;
}

interface SessionScore {
  wins: number;
  losses: number;
}

interface PlayerOfSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerOfSessionDialog({ isOpen, onClose }: PlayerOfSessionDialogProps) {
  const [topPlayers, setTopPlayers] = useState<Array<Player[]>>([[], [], []]); // Gold, Silver, Bronze

  // Load and rank players when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAndRankPlayers();
    }
  }, [isOpen]);

  const loadAndRankPlayers = () => {
    // Get session scores
    const sessionScores = getStorageItem<Record<string, SessionScore>>("sessionScores", {});
    
    if (Object.keys(sessionScores).length === 0) {
      return;
    }

    try {
      // Get all members to get player metadata
      const membersData = localStorage.getItem("members");
      let members: Player[] = [];
      
      if (membersData) {
        try {
          members = JSON.parse(membersData);
        } catch (e) {
          console.error("Error parsing members data", e);
        }
      }
      
      // Create player list from session scores
      const playersList: Player[] = Object.entries(sessionScores).map(([name, scores]) => {
        const member = members.find(m => m.name === name);
        return {
          name,
          gender: member?.gender || "male",
          isGuest: member?.isGuest || false,
          wins: scores.wins,
          losses: scores.losses
        };
      });
      
      // Filter players with wins
      const playersWithWins = playersList.filter(player => player.wins && player.wins > 0);
      
      // Sort players by wins (descending) and then by losses (ascending)
      const sortedPlayers = playersWithWins.sort((a, b) => {
        const winsA = a.wins || 0;
        const winsB = b.wins || 0;
        const lossesA = a.losses || 0;
        const lossesB = b.losses || 0;
        
        if (winsB !== winsA) {
          return winsB - winsA; // Sort by wins descending
        }
        return lossesA - lossesB; // If same wins, sort by losses ascending
      });
      
      if (sortedPlayers.length === 0) {
        return;
      }
      
      // Group players into Gold, Silver, Bronze based on wins
      const gold: Player[] = [];
      const silver: Player[] = [];
      const bronze: Player[] = [];
      
      // Get the win counts for 1st, 2nd, and 3rd place
      const winCounts = Array.from(new Set(sortedPlayers.map(p => p.wins))).slice(0, 3);
      
      // Assign players to their respective medals
      sortedPlayers.forEach(player => {
        const playerWins = player.wins || 0;
        
        if (playerWins === winCounts[0]) {
          gold.push(player);
        } else if (winCounts.length > 1 && playerWins === winCounts[1]) {
          silver.push(player);
        } else if (winCounts.length > 2 && playerWins === winCounts[2]) {
          bronze.push(player);
        }
      });
      
      setTopPlayers([gold, silver, bronze]);
    } catch (e) {
      console.error("Error processing session player scores", e);
    }
  };

  const getMedalColor = (index: number): string => {
    switch (index) {
      case 0: return "text-yellow-500"; // Gold
      case 1: return "text-gray-400";   // Silver
      case 2: return "text-amber-700";  // Bronze
      default: return "";
    }
  };
  
  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 1: return <Medal className="h-8 w-8 text-gray-400" />;
      case 2: return <Award className="h-8 w-8 text-amber-700" />;
      default: return null;
    }
  };
  
  const getMedalName = (index: number): string => {
    switch (index) {
      case 0: return "Gold";
      case 1: return "Silver";
      case 2: return "Bronze";
      default: return "";
    }
  };

  // Check if there are any players to show
  const hasPlayers = topPlayers.some(group => group.length > 0);
  
  return (
    <Dialog open={isOpen && hasPlayers} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Player of the Session</DialogTitle>
          <DialogDescription className="text-center">
            Congratulations to our top players of this session!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {topPlayers.map((playerGroup, index) => 
            playerGroup.length > 0 && (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  {getMedalIcon(index)}
                  <h3 className={`font-bold ${getMedalColor(index)}`}>
                    {getMedalName(index)} Medal
                    {playerGroup.length > 1 ? " Winners" : " Winner"}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {playerGroup.map((player) => (
                    <div 
                      key={player.name} 
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                        <span className="font-medium">{player.name}</span>
                        {player.isGuest && (
                          <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
                        )}
                      </div>
                      <div className="text-sm">
                        W {player.wins || 0} – L {player.losses || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
