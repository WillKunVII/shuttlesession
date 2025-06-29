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

  useEffect(() => {
    const courtCount = parseInt(localStorage.getItem("courtCount") || "4", 10);
    const validCourtCount = Math.max(1, Math.min(8, courtCount));
    
    const savedCourts = localStorage.getItem("courts");
    if (savedCourts) {
      try {
        let parsedCourts = JSON.parse(savedCourts);
        
        if (parsedCourts.length < validCourtCount) {
          for (let i = parsedCourts.length; i < validCourtCount; i++) {
            parsedCourts.push(predefinedCourts[i]);
          }
        } else if (parsedCourts.length > validCourtCount) {
          parsedCourts = parsedCourts.filter((court: Court, index: number) => 
            index < validCourtCount || court.status === "occupied"
          );
          
          if (parsedCourts.length > validCourtCount) {
            parsedCourts = parsedCourts.slice(0, validCourtCount);
          }
        }
        
        setCourts(parsedCourts);
      } catch (e) {
        console.error("Error parsing courts from localStorage", e);
        setCourts(predefinedCourts.slice(0, validCourtCount));
      }
    } else {
      setCourts(predefinedCourts.slice(0, validCourtCount));
    }
    
    const savedOrdering = localStorage.getItem("courtOrdering");
    if (savedOrdering === "ascending" || savedOrdering === "descending") {
      setCourtOrdering(savedOrdering as CourtOrdering);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("courts", JSON.stringify(courts));
  }, [courts]);

  const getSortedCourts = () => {
    return [...courts].sort((a, b) => {
      if (courtOrdering === "ascending") {
        return a.id - b.id;
      } else {
        return b.id - a.id;
      }
    });
  };

  // Function to assign players to a court - CRITICAL: preserve player IDs properly
  const assignPlayersToCourtById = (courtId: number, players: any[]) => {
    if (players.length === 4) {
      console.log("useCourtManagement: Assigning players to court", courtId);
      console.log("useCourtManagement: Input players:", players.map(p => ({ id: p.id, name: p.name })));
      
      // Validate that all players have IDs
      const playersWithIds = players.filter(p => p.id != null);
      if (playersWithIds.length !== 4) {
        console.error("useCourtManagement: Some players missing IDs!", {
          totalPlayers: players.length,
          playersWithIds: playersWithIds.length,
          players: players.map(p => ({ id: p.id, name: p.name }))
        });
      }
      
      setCourts(courts.map(court => {
        if (court.id === courtId) {
          const assignedPlayers = players.map(p => {
            const courtPlayer = {
              id: p.id, // CRITICAL: Preserve the original player ID
              name: p.name, 
              gender: p.gender,
              isGuest: p.isGuest || false
            };
            console.log("useCourtManagement: Assigning player to court:", courtPlayer);
            return courtPlayer;
          });

          return {
            ...court,
            status: "occupied" as const,
            players: assignedPlayers,
            timeRemaining: 15
          };
        }
        return court;
      }));
      return true;
    }
    console.error("useCourtManagement: Cannot assign - need exactly 4 players, got", players.length);
    return false;
  };

  // Function to end a game on a court - CRITICAL: return players with their preserved IDs
  const endGameOnCourt = (courtId: number) => {
    const courtToEnd = courts.find(c => c.id === courtId);
    
    if (courtToEnd && courtToEnd.status === "occupied") {
      console.log("useCourtManagement: Ending game on court", courtId);
      console.log("useCourtManagement: Players on court:", courtToEnd.players.map(p => ({ id: p.id, name: p.name })));
      
      // Validate that court players have IDs
      const playersWithIds = courtToEnd.players.filter(p => p.id != null);
      if (playersWithIds.length !== courtToEnd.players.length) {
        console.error("useCourtManagement: Some court players missing IDs!", {
          totalPlayers: courtToEnd.players.length,
          playersWithIds: playersWithIds.length,
          players: courtToEnd.players.map(p => ({ id: p.id, name: p.name }))
        });
      }
      
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
      const releasedPlayers = courtToEnd.players.map(p => ({
        id: p.id, // CRITICAL: Return the preserved ID
        name: p.name,
        gender: p.gender,
        isGuest: p.isGuest || false
      }));
      
      console.log("useCourtManagement: Releasing players:", releasedPlayers.map(p => ({ id: p.id, name: p.name })));
      return releasedPlayers;
    }
    
    console.error("useCourtManagement: Cannot end game - court not found or not occupied");
    return [];
  };

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
