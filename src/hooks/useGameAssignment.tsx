
import { useState, useEffect } from "react";
import { PlayPreference } from "@/types/member";

export type Player = {
  id: number;
  name: string;
  gender: "male" | "female";
  waitingTime: number;
  isGuest?: boolean;
  wins?: number;
  losses?: number;
  playPreferences?: PlayPreference[];
}

export function useGameAssignment() {
  const [nextGamePlayers, setNextGamePlayers] = useState<Player[]>([]);

  // Load next game players from localStorage on component mount
  useEffect(() => {
    const savedNextGame = localStorage.getItem("nextGamePlayers");
    if (savedNextGame) {
      try {
        const parsedData = JSON.parse(savedNextGame);
        // Ensure we're setting an array (even if the stored data is not an array)
        setNextGamePlayers(Array.isArray(parsedData) ? parsedData : []);
      } catch (e) {
        console.error("Error parsing next game players from localStorage", e);
        setNextGamePlayers([]);
      }
    }
  }, []);

  // Save next game players to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("nextGamePlayers", JSON.stringify(nextGamePlayers));
  }, [nextGamePlayers]);

  // Set next game players 
  const setNextGame = (players: Player[]) => {
    if (!Array.isArray(players)) {
      console.error("setNextGame received non-array value:", players);
      setNextGamePlayers([]);
      return;
    }
    setNextGamePlayers(players);
  };

  // Clear next game players and return them
  const clearNextGame = () => {
    const players = [...nextGamePlayers];
    setNextGamePlayers([]);
    return players;
  };

  // Check if next game is ready (has 4 players)
  const isNextGameReady = () => {
    return Array.isArray(nextGamePlayers) && nextGamePlayers.length === 4;
  };

  // Determine the game type based on players
  const getGameType = (): PlayPreference => {
    if (!isNextGameReady()) return "";
    
    const isMixedPossible = 
      nextGamePlayers.filter(p => p.gender === "male").length === 2 && 
      nextGamePlayers.filter(p => p.gender === "female").length === 2;
    
    const isLadiesPossible = 
      nextGamePlayers.filter(p => p.gender === "female").length === 4;
    
    const allPreferences = nextGamePlayers.flatMap(p => p.playPreferences || []);
    
    if (isMixedPossible && allPreferences.includes("Mixed")) {
      return "Mixed";
    } else if (isLadiesPossible && allPreferences.includes("Ladies")) {
      return "Ladies";
    } else {
      return "Open";
    }
  };

  return {
    nextGamePlayers,
    setNextGame,
    clearNextGame,
    isNextGameReady,
    getGameType
  };
}
