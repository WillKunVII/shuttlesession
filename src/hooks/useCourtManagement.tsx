
import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/playerTypes";
import { getStorageItem, setStorageItem } from "@/utils/storageUtils";

// Initial courts data
const initialCourts = [
  { id: 1, name: "Court 1", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 2, name: "Court 2", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 3, name: "Court 3", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 4, name: "Court 4", status: "available" as const, players: [], timeRemaining: 0 },
];

export type Court = {
  id: number;
  name: string;
  status: "available" | "occupied";
  players: Array<{name: string; gender: "male" | "female"; isGuest?: boolean}>;
  timeRemaining: number;
}

export type CourtOrdering = "ascending" | "descending";

export function useCourtManagement() {
  const [courts, setCourts] = useState<Court[]>(initialCourts);
  const [courtOrdering, setCourtOrdering] = useState<CourtOrdering>("ascending");

  // Load courts from localStorage on component mount
  useEffect(() => {
    const savedCourts = localStorage.getItem("courts");
    if (savedCourts) {
      try {
        setCourts(JSON.parse(savedCourts));
      } catch (e) {
        console.error("Error parsing courts from localStorage", e);
      }
    }
    
    const savedOrdering = localStorage.getItem("courtOrdering");
    if (savedOrdering === "ascending" || savedOrdering === "descending") {
      setCourtOrdering(savedOrdering as CourtOrdering);
    }
  }, []);

  // Save courts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("courts", JSON.stringify(courts));
  }, [courts]);

  // Get courts sorted based on the courtOrdering setting
  const getSortedCourts = useCallback(() => {
    return [...courts].sort((a, b) => {
      if (courtOrdering === "ascending") {
        return a.id - b.id;
      } else {
        return b.id - a.id;
      }
    });
  }, [courts, courtOrdering]);

  // Function to assign players to a court
  const assignPlayersToCourtById = useCallback((courtId: number, players: Player[]) => {
    console.log("Assigning players to court:", courtId, players);
    
    if (players.length === 4) {
      // Create a deep copy of the players to avoid any reference issues
      const playersCopy = players.map(p => ({
        name: p.name, 
        gender: p.gender,
        isGuest: p.isGuest
      }));
      
      setCourts(prevCourts => {
        const updatedCourts = prevCourts.map(court => {
          if (court.id === courtId) {
            console.log(`Updating court ${courtId} with players:`, playersCopy);
            return {
              ...court,
              status: "occupied" as const,
              players: playersCopy,
              timeRemaining: 15
            };
          }
          return court;
        });
        
        // Log the updated court for debugging
        const updatedCourt = updatedCourts.find(c => c.id === courtId);
        console.log("Updated court state:", updatedCourt);
        
        return updatedCourts;
      });
      
      return true;
    }
    return false;
  }, []);

  // Function to end a game on a court
  const endGameOnCourt = useCallback((courtId: number) => {
    const courtToEnd = courts.find(c => c.id === courtId);
    
    if (courtToEnd && courtToEnd.status === "occupied") {
      // Store players before clearing
      const releasedPlayers = [...courtToEnd.players];
      
      // Update court status
      setCourts(prevCourts => prevCourts.map(court => {
        if (court.id === courtId) {
          return {
            ...court,
            status: "available" as const,
            players: [],
            timeRemaining: 0
          };
        }
        return court;
      }));
      
      return releasedPlayers;
    }
    
    return [];
  }, [courts]);

  return {
    courts,
    getSortedCourts,
    assignPlayersToCourtById,
    endGameOnCourt
  };
}
