
import { useState, useEffect } from "react";

export type Player = {
  id: number;
  name: string;
  gender: "male" | "female";
  skill: string;
  waitingTime: number;
  isGuest?: boolean;
}

export function useGameAssignment() {
  const [nextGamePlayers, setNextGamePlayers] = useState<Player[]>([]);

  // Load next game players from localStorage on component mount
  useEffect(() => {
    const savedNextGame = localStorage.getItem("nextGamePlayers");
    if (savedNextGame) {
      try {
        setNextGamePlayers(JSON.parse(savedNextGame));
      } catch (e) {
        console.error("Error parsing next game players from localStorage", e);
      }
    }
  }, []);

  // Save next game players to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("nextGamePlayers", JSON.stringify(nextGamePlayers));
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
