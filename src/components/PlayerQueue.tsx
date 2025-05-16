
import { useState, useEffect } from "react";
import { CircleDot, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPlayerButton } from "@/components/AddPlayerButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { isScoreKeepingEnabled } from "@/utils/storageUtils";
import { Badge } from "@/components/ui/badge";
import { PlayPreference } from "@/types/member";

interface Player {
  id: number;
  name: string;
  waitingTime: number;
  gender: "male" | "female";
  isGuest?: boolean;
  wins?: number;
  losses?: number;
  playPreferences?: PlayPreference[];
}

interface PlayerQueueProps {
  players: Player[];
  onPlayerSelect: (selectedPlayers: Player[]) => void;
  onPlayerLeave?: (playerId: number) => void;
  onAddPlayer?: (player: {name: string, gender: "male" | "female", isGuest: boolean, playPreferences: PlayPreference[]}) => void;
}

export function PlayerQueue({ players, onPlayerSelect, onPlayerLeave, onAddPlayer }: PlayerQueueProps) {
  const [selected, setSelected] = useState<Player[]>([]);
  const scoreKeepingEnabled = isScoreKeepingEnabled();
  const [preferencesEnabled, setPreferencesEnabled] = useState(false);
  
  // Get player pool size from localStorage or default to 8
  const playerPoolSize = Number(localStorage.getItem("playerPoolSize")) || 8;
  
  // Load preferences setting
  useEffect(() => {
    const enablePref = localStorage.getItem("enablePlayerPreferences");
    setPreferencesEnabled(enablePref === "true");
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
  
  const togglePlayerSelection = (player: Player) => {
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
  
  const handlePlayerLeave = (playerId: number) => {
    // Remove from selection if present
    setSelected(selected.filter(p => p.id !== playerId));
    // Call the provided onPlayerLeave callback
    if (onPlayerLeave) {
      onPlayerLeave(playerId);
    }
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
            disabled={selected.length !== 4}
            onClick={() => {
              onPlayerSelect(selected);
              setSelected([]);
            }}
          >
            Create Game
          </Button>
        </div>
      </div>
      
      {players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No players in queue
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-30rem)]">
          <div className="space-y-2 pr-4">
            {players.map((player, index) => (
              <React.Fragment key={player.id}>
                {index === playerPoolSize && players.length > playerPoolSize && (
                  <div className="relative my-4">
                    <Separator className="absolute inset-0 my-2" />
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-xs text-muted-foreground">
                        Player Pool Limit
                      </span>
                    </div>
                  </div>
                )}
                <div
                  className={`border rounded-lg p-3 flex items-center justify-between cursor-pointer ${
                    selected.some(p => p.id === player.id) 
                      ? "bg-shuttle-lightBlue border-shuttle-blue" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => togglePlayerSelection(player)}
                >
                  <div className="flex items-center gap-2">
                    <CircleDot className={player.gender === 'male' ? 'text-blue-500' : 'text-pink-500'} size={16} />
                    <span className="font-medium">{player.name}</span>
                    {player.isGuest && (
                      <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
                    )}
                    
                    {scoreKeepingEnabled && (player.wins !== undefined || player.losses !== undefined) && (
                      <span className="ml-1 text-sm text-gray-500">
                        W {player.wins || 0} – L {player.losses || 0}
                      </span>
                    )}
                    
                    {/* Display play preferences - always visible now */}
                    {preferencesEnabled && player.playPreferences && player.playPreferences.length > 0 && (
                      <div className="flex gap-1 ml-2">
                        {player.playPreferences.map(pref => (
                          <Badge key={pref} variant="outline" className="text-xs">
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    {selected.some(p => p.id === player.id) && (
                      <div className="h-5 w-5 rounded-full bg-shuttle-blue flex items-center justify-center mr-2">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayerLeave(player.id);
                      }}
                    >
                      Leave
                    </Button>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
