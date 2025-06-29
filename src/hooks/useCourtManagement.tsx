
import { useState, useEffect } from "react";
import { Court } from "@/types/DashboardTypes";

// Initial courts data for up to 8 courts
const predefinedCourts = [
  { id: 1, name: "Court 1", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 2, name: "Court 2", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 3, name: "Court 3", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 4, name: "Court 4", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 5, name: "Court 5", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 6, name: "Court 6", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 7, name: "Court 7", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 8, name: "Court 8", status: "available" as const, players: [], timeRemaining: 0 },
];

export type CourtOrdering = "ascending" | "descending";

export function useCourtManagement() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [courtOrdering, setCourtOrdering] = useState<CourtOrdering>("ascending");

  // Load courts from localStorage on component mount
  useEffect(() => {
    // Get court count setting (default to 4 if not set)
    const courtCount = parseInt(localStorage.getItem("courtCount") || "4", 10);
    
    // Limit court count to valid range
    const validCourtCount = Math.max(1, Math.min(8, courtCount));
    
    const savedCourts = localStorage.getItem("courts");
    if (savedCourts) {
      try {
        let parsedCourts = JSON.parse(savedCourts);
        
        // Adjust the number of courts based on the setting
        if (parsedCourts.length < validCourtCount) {
          // Add more courts if needed
          for (let i = parsedCourts.length; i < validCourtCount; i++) {
            parsedCourts.push(predefinedCourts[i]);
          }
        } else if (parsedCourts.length > validCourtCount) {
          // Remove courts if needed, only keep courts that are available
          parsedCourts = parsedCourts.filter((court: Court, index: number) => 
            index < validCourtCount || court.status === "occupied"
          );
          
          // Ensure we have exactly the right number of courts
          if (parsedCourts.length > validCourtCount) {
            parsedCourts = parsedCourts.slice(0, validCourtCount);
          }
        }
        
        setCourts(parsedCourts);
      } catch (e) {
        console.error("Error parsing courts from localStorage", e);
        // If there was an error, initialize with the default number of courts
        setCourts(predefinedCourts.slice(0, validCourtCount));
      }
    } else {
      // If no courts in localStorage, initialize with the default number of courts
      setCourts(predefinedCourts.slice(0, validCourtCount));
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
  const getSortedCourts = () => {
    return [...courts].sort((a, b) => {
      if (courtOrdering === "ascending") {
        return a.id - b.id;
      } else {
        return b.id - a.id;
      }
    });
  };

  // Function to assign players to a court - now preserves full player data with IDs
  const assignPlayersToCourtById = (courtId: number, players: any[]) => {
    if (players.length === 4) {
      console.log("useCourtManagement: Assigning players to court", courtId, players.map(p => ({ id: p.id, name: p.name })));
      
      setCourts(courts.map(court => {
        if (court.id === courtId) {
          return {
            ...court,
            status: "occupied" as const,
            // Store complete player data including IDs
            players: players.map(p => ({
              id: p.id, // Preserve the player ID
              name: p.name, 
              gender: p.gender,
              isGuest: p.isGuest
            })),
            timeRemaining: 15
          };
        }
        return court;
      }));
      return true;
    }
    return false;
  };

  // Function to end a game on a court - returns players with their IDs
  const endGameOnCourt = (courtId: number) => {
    const courtToEnd = courts.find(c => c.id === courtId);
    
    if (courtToEnd && courtToEnd.status === "occupied") {
      console.log("useCourtManagement: Ending game on court", courtId, "players:", courtToEnd.players);
      
      // Update court status
      setCourts(courts.map(court => {
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
      
      // Return the players with their preserved IDs
      return courtToEnd.players;
    }
    
    return [];
  };

  // Update a player's info in all courts by ID (preferred) or name (fallback)
  const updateCourtPlayerInfo = (updated: { 
    id?: number; 
    name: string; 
    gender?: "male" | "female"; 
    isGuest?: boolean; 
    playPreferences?: any[] 
  }) => {
    setCourts((prevCourts) =>
      prevCourts.map((court) => ({
        ...court,
        players: court.players.map((p: any) => {
          // Use ID for matching if available, otherwise fall back to name
          const matches = updated.id ? p.id === updated.id : p.name === updated.name;
          return matches
            ? {
                ...p,
                name: updated.name,
                ...(updated.gender && { gender: updated.gender }),
                ...(typeof updated.isGuest === "boolean" && { isGuest: updated.isGuest }),
                ...(updated.playPreferences && { playPreferences: updated.playPreferences })
              }
            : p;
        })
      }))
    );
  };

  return {
    courts,
    getSortedCourts,
    assignPlayersToCourtById,
    endGameOnCourt,
    updateCourtPlayerInfo
  };
}
