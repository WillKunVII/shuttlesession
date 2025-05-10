
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayerQueue } from "@/components/PlayerQueue";
import { NextGame } from "@/components/NextGame";
import { CourtStatus } from "@/components/CourtStatus";

// Starting with no players in the queue
const initialPlayers: any[] = [];

// Mock data for courts with gender added to players
const initialCourts = [
  { id: 1, name: "Court 1", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 2, name: "Court 2", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 3, name: "Court 3", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 4, name: "Court 4", status: "available" as const, players: [], timeRemaining: 0 },
];

export default function Dashboard() {
  const [queue, setQueue] = useState(initialPlayers);
  const [nextGamePlayers, setNextGamePlayers] = useState<any[]>([]);
  const [courts, setCourts] = useState(initialCourts);
  const [courtOrdering, setCourtOrdering] = useState<"ascending" | "descending">("ascending");

  // Load settings on component mount
  useEffect(() => {
    const savedOrdering = localStorage.getItem("courtOrdering");
    if (savedOrdering === "ascending" || savedOrdering === "descending") {
      setCourtOrdering(savedOrdering);
    }
  }, []);

  // Sort courts based on courtOrdering setting
  const sortedCourts = [...courts].sort((a, b) => {
    if (courtOrdering === "ascending") {
      return a.id - b.id;
    } else {
      return b.id - a.id;
    }
  });

  // Function to generate next game players (manual or auto)
  const generateNextGame = (auto = false) => {
    // For auto mode, just take the top 4 players in the queue
    if (auto && queue.length >= 4) {
      const nextPlayers = queue.slice(0, 4);
      setNextGamePlayers(nextPlayers);
      setQueue(queue.slice(4));
    }
    // Manual mode is handled by PlayerQueue component
  };

  // Function to assign next game to a court
  const assignToFreeCourt = (courtId: number) => {
    if (nextGamePlayers.length === 4) {
      setCourts(courts.map(court => {
        if (court.id === courtId) {
          return {
            ...court,
            status: "occupied" as const,
            players: nextGamePlayers.map(p => ({
              name: p.name, 
              gender: p.gender,
              isGuest: p.isGuest
            })),
            timeRemaining: 15
          };
        }
        return court;
      }));
      setNextGamePlayers([]);
    }
  };

  // Function to end a game on a court
  const endGame = (courtId: number) => {
    const courtToEnd = courts.find(c => c.id === courtId);
    if (courtToEnd && courtToEnd.status === "occupied") {
      // Add players back to the queue
      const playerObjects = courtToEnd.players.map((player, idx) => ({
        id: Date.now() + idx,
        name: player.name,
        gender: player.gender as "male" | "female",
        skill: ["beginner", "intermediate", "advanced"][Math.floor(Math.random() * 3)],
        waitingTime: 0,
        isGuest: player.isGuest
      }));
      
      setQueue([...queue, ...playerObjects]);
      
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
    }
  };

  // Add function to handle player leaving the queue
  const handlePlayerLeave = (playerId: number) => {
    setQueue(queue.filter(player => player.id !== playerId));
  };

  // Add function to handle adding a new player
  const handleAddPlayer = (player: {name: string, gender: "male" | "female", isGuest: boolean}) => {
    const newPlayer = {
      id: Date.now(),
      name: player.name,
      gender: player.gender,
      isGuest: player.isGuest,
      skill: "intermediate", // Default skill level
      waitingTime: 0
    };
    
    setQueue([...queue, newPlayer]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left column: Courts - stacked vertically */}
      <div className="flex flex-col space-y-3">
        <div className="bg-white rounded-xl shadow-sm p-3">
          <h2 className="text-xl font-semibold mb-3">Court Status</h2>
          <div className="flex flex-col space-y-3">
            {sortedCourts.map(court => (
              <CourtStatus 
                key={court.id}
                court={court}
                onAssign={() => assignToFreeCourt(court.id)}
                onEndGame={() => endGame(court.id)}
                nextGameReady={nextGamePlayers.length === 4}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Right column: Next Game and Player Queue */}
      <div className="flex flex-col space-y-3">
        {/* Top of right column: Next Game */}
        <div className="bg-white rounded-xl shadow-sm p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Next Game</h2>
            <Button 
              variant="outline" 
              onClick={() => generateNextGame(true)}
              disabled={queue.length < 4}
              size="sm"
            >
              Auto-Select Players
            </Button>
          </div>
          <NextGame 
            players={nextGamePlayers}
            onClear={() => {
              // Put players back in the queue
              setQueue([...queue, ...nextGamePlayers]);
              setNextGamePlayers([]);
            }}
          />
        </div>
        
        {/* Bottom of right column: Player Queue */}
        <div className="bg-white rounded-xl shadow-sm p-3">
          <PlayerQueue 
            players={queue} 
            onPlayerSelect={(selectedPlayers) => {
              if (selectedPlayers.length === 4) {
                setNextGamePlayers(selectedPlayers);
                setQueue(queue.filter(p => !selectedPlayers.includes(p)));
              }
            }}
            onPlayerLeave={handlePlayerLeave}
            onAddPlayer={handleAddPlayer}
          />
        </div>
      </div>
    </div>
  );
}
