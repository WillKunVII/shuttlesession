import { useState, useEffect, useCallback, useMemo } from "react";
import { Court } from "@/types/DashboardTypes";

// Initial courts data for up to 8 courts (memoized)
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

  // Optimized court initialization
  useEffect(() => {
    const courtCount = parseInt(localStorage.getItem("courtCount") || "4", 10);
    const validCourtCount = Math.max(1, Math.min(8, courtCount));
    
    const savedCourts = localStorage.getItem("courts");
    if (savedCourts) {
      try {
        let parsedCourts = JSON.parse(savedCourts);
        
        // Optimize court array adjustments
        if (parsedCourts.length !== validCourtCount) {
          if (parsedCourts.length < validCourtCount) {
            // Add missing courts
            for (let i = parsedCourts.length; i < validCourtCount; i++) {
              parsedCourts.push(predefinedCourts[i]);
            }
          } else {
            // Remove excess courts (keep occupied ones if possible)
            const occupiedCourts = parsedCourts.filter((court: Court) => court.status === "occupied");
            const availableCourts = parsedCourts.filter((court: Court, index: number) => 
              court.status === "available" && index < validCourtCount
            );
            
            parsedCourts = [...occupiedCourts.slice(0, validCourtCount), ...availableCourts]
              .slice(0, validCourtCount);
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

  // Optimized localStorage save (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("courts", JSON.stringify(courts));
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [courts]);

  // Memoized sorted courts
  const getSortedCourts = useMemo(() => {
    return [...courts].sort((a, b) => {
      if (courtOrdering === "ascending") {
        return a.id - b.id;
      } else {
        return b.id - a.id;
      }
    });
  }, [courts, courtOrdering]);

  // Optimized player assignment with proper ID preservation
  const assignPlayersToCourtById = useCallback((courtId: number, players: any[]) => {
    if (players.length !== 4) {
      console.error("useCourtManagement: Need exactly 4 players, got", players.length);
      return false;
    }

    // Validate player IDs upfront
    const invalidPlayers = players.filter(p => !p.id);
    if (invalidPlayers.length > 0) {
      console.error("useCourtManagement: Players missing IDs:", invalidPlayers);
      return false;
    }

    console.log("useCourtManagement: Assigning players to court", courtId);
    
    setCourts(prevCourts => 
      prevCourts.map(court => {
        if (court.id !== courtId) return court;
        
        // Preserve player IDs and essential data
        const assignedPlayers = players.map(p => ({
          id: p.id, // CRITICAL: Preserve original ID
          name: p.name,
          gender: p.gender,
          isGuest: p.isGuest || false
        }));

        console.log("useCourtManagement: Assigned players:", assignedPlayers.map(p => ({ id: p.id, name: p.name })));

        return {
          ...court,
          status: "occupied" as const,
          players: assignedPlayers,
          timeRemaining: 15
        };
      })
    );
    
    return true;
  }, []);

  // Optimized game ending with proper ID preservation
  const endGameOnCourt = useCallback((courtId: number) => {
    const courtToEnd = courts.find(c => c.id === courtId);
    
    if (!courtToEnd || courtToEnd.status !== "occupied") {
      console.error("useCourtManagement: Cannot end game - court not occupied");
      return [];
    }

    console.log("useCourtManagement: Ending game on court", courtId);
    
    // Validate player IDs before ending
    const playersWithoutIds = courtToEnd.players.filter(p => !p.id);
    if (playersWithoutIds.length > 0) {
      console.error("useCourtManagement: Court players missing IDs:", playersWithoutIds);
    }
    
    // Store players before clearing court
    const releasedPlayers = courtToEnd.players.map(p => ({
      id: p.id, // CRITICAL: Preserve ID
      name: p.name,
      gender: p.gender,
      isGuest: p.isGuest || false
    }));
    
    // Update court status
    setCourts(prevCourts =>
      prevCourts.map(court => {
        if (court.id !== courtId) return court;
        
        return {
          ...court,
          status: "available" as const,
          players: [],
          timeRemaining: 0
        };
      })
    );
    
    console.log("useCourtManagement: Released players:", releasedPlayers.map(p => ({ id: p.id, name: p.name })));
    return releasedPlayers;
  }, [courts]);

  // Optimized player info update
  const updateCourtPlayerInfo = useCallback((updated: { 
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
          
          if (!matches) return p;
          
          return {
            ...p,
            name: updated.name,
            ...(updated.gender && { gender: updated.gender }),
            ...(typeof updated.isGuest === "boolean" && { isGuest: updated.isGuest }),
            ...(updated.playPreferences && { playPreferences: updated.playPreferences })
          };
        })
      }))
    );
  }, []);

  return {
    courts,
    getSortedCourts,
    assignPlayersToCourtById,
    endGameOnCourt,
    updateCourtPlayerInfo
  };
}
