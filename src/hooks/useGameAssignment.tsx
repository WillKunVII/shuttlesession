
import { useState } from "react";

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
