
import { useState, useEffect } from "react";
import { getStorageItem, setStorageItem } from "@/utils/storageUtils";

export type Player = {
  id: string;
  name: string;
  gender: "male" | "female";
  waitingTime: number;
  isGuest?: boolean;
  wins?: number;
  losses?: number;
}

export function useGameAssignment() {
  const [nextGamePlayers, setNextGamePlayers] = useState<Player[]>([]);

  // Load next game players from localStorage on component mount
  useEffect(() => {
    const savedNextGame = getStorageItem("nextGamePlayers", ""); // Add second parameter with default value
    if (savedNextGame) {
      try {
        const parsedData = JSON.parse(savedNextGame as string); // Add type assertion
        setNextGamePlayers(parsedData);
      } catch (e) {
        console.error("Error parsing next game players from localStorage", e);
      }
    }
  }, []);

  // Save next game players to localStorage whenever it changes
  useEffect(() => {
    setStorageItem("nextGamePlayers", JSON.stringify(nextGamePlayers));
  }, [nextGamePlayers]);

  // Set next game players 
  const setNextGame = (players: Player[]) => {
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
    return nextGamePlayers.length === 4;
  };

  return {
    nextGamePlayers,
    setNextGame,
    clearNextGame,
    isNextGameReady
  };
}
