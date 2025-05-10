
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayerQueue } from "@/components/PlayerQueue";
import { NextGame } from "@/components/NextGame";
import { CourtStatus } from "@/components/CourtStatus";
import { AddPlayerButton } from "@/components/AddPlayerButton";

// Mock data for players with gender added
const initialPlayers = [
  { id: 1, name: "Sarah Johnson", skill: "advanced", waitingTime: 12, gender: "female" },
  { id: 2, name: "Mike Smith", skill: "intermediate", waitingTime: 8, gender: "male" },
  { id: 3, name: "Emma Wilson", skill: "beginner", waitingTime: 5, gender: "female" },
  { id: 4, name: "John Davis", skill: "advanced", waitingTime: 15, gender: "male" },
  { id: 5, name: "Lisa Brown", skill: "intermediate", waitingTime: 10, gender: "female" },
  { id: 6, name: "David Lee", skill: "beginner", waitingTime: 3, gender: "male" },
  { id: 7, name: "Karen White", skill: "intermediate", waitingTime: 7, gender: "female" },
  { id: 8, name: "Tom Jackson", skill: "advanced", waitingTime: 9, gender: "male" },
];

// Mock data for courts with gender added to players
const initialCourts = [
  { id: 1, name: "Court 1", status: "occupied" as const, players: [
    {name: "Mark", gender: "male"}, 
    {name: "Jane", gender: "female"}, 
    {name: "Alex", gender: "male"}, 
    {name: "Susan", gender: "female"}
  ], timeRemaining: 8 },
  { id: 2, name: "Court 2", status: "available" as const, players: [], timeRemaining: 0 },
  { id: 3, name: "Court 3", status: "occupied" as const, players: [
    {name: "Robert", gender: "male"}, 
    {name: "Carol", gender: "female"}, 
    {name: "Steve", gender: "male"}, 
    {name: "Amy", gender: "female"}
  ], timeRemaining: 4 },
  { id: 4, name: "Court 4", status: "occupied" as const, players: [
    {name: "Kevin", gender: "male"}, 
    {name: "Linda", gender: "female"}, 
    {name: "Paul", gender: "male"}, 
    {name: "Maria", gender: "female"}
  ], timeRemaining: 12 },
];

export default function Dashboard() {
  const [queue, setQueue] = useState(initialPlayers);
  const [nextGamePlayers, setNextGamePlayers] = useState<any[]>([]);
  const [courts, setCourts] = useState(initialCourts);

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
            players: nextGamePlayers.map(p => ({name: p.name, gender: p.gender})),
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
        gender: player.gender,
        skill: ["beginner", "intermediate", "advanced"][Math.floor(Math.random() * 3)],
        waitingTime: 0
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column: Courts - stacked vertically */}
      <div className="flex flex-col space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Court Status</h2>
          <div className="flex flex-col space-y-4">
            {courts.map(court => (
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
      <div className="flex flex-col space-y-6">
        {/* Top of right column: Next Game */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Next Game</h2>
          <NextGame 
            players={nextGamePlayers}
            onClear={() => {
              // Put players back in the queue
              setQueue([...queue, ...nextGamePlayers]);
              setNextGamePlayers([]);
            }}
          />
          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => generateNextGame(true)}
              disabled={queue.length < 4}
            >
              Auto-Select Players
            </Button>
            <Button 
              disabled={nextGamePlayers.length !== 4 || !courts.some(c => c.status === "available")} 
              onClick={() => {
                const freeCourt = courts.find(c => c.status === "available");
                if (freeCourt) {
                  assignToFreeCourt(freeCourt.id);
                }
              }}
              className="bg-shuttle-primary hover:bg-shuttle-primary/90"
            >
              Assign to Free Court
            </Button>
          </div>
        </div>
        
        {/* Bottom of right column: Player Queue */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Player Queue</h2>
            <AddPlayerButton />
          </div>
          <PlayerQueue 
            players={queue} 
            onPlayerSelect={(selectedPlayers) => {
              if (selectedPlayers.length === 4) {
                setNextGamePlayers(selectedPlayers);
                setQueue(queue.filter(p => !selectedPlayers.includes(p)));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
