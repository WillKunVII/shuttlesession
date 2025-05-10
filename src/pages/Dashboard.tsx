
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayerQueue } from "@/components/PlayerQueue";
import { NextGame } from "@/components/NextGame";
import { CourtStatus } from "@/components/CourtStatus";
import { AddPlayerButton } from "@/components/AddPlayerButton";

// Mock data for players
const initialPlayers = [
  { id: 1, name: "Sarah Johnson", skill: "advanced", waitingTime: 12 },
  { id: 2, name: "Mike Smith", skill: "intermediate", waitingTime: 8 },
  { id: 3, name: "Emma Wilson", skill: "beginner", waitingTime: 5 },
  { id: 4, name: "John Davis", skill: "advanced", waitingTime: 15 },
  { id: 5, name: "Lisa Brown", skill: "intermediate", waitingTime: 10 },
  { id: 6, name: "David Lee", skill: "beginner", waitingTime: 3 },
  { id: 7, name: "Karen White", skill: "intermediate", waitingTime: 7 },
  { id: 8, name: "Tom Jackson", skill: "advanced", waitingTime: 9 },
];

// Mock data for courts
const initialCourts = [
  { id: 1, name: "Court 1", status: "occupied", players: ["Mark", "Jane", "Alex", "Susan"], timeRemaining: 8 },
  { id: 2, name: "Court 2", status: "available", players: [], timeRemaining: 0 },
  { id: 3, name: "Court 3", status: "occupied", players: ["Robert", "Carol", "Steve", "Amy"], timeRemaining: 4 },
  { id: 4, name: "Court 4", status: "occupied", players: ["Kevin", "Linda", "Paul", "Maria"], timeRemaining: 12 },
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
            status: "occupied",
            players: nextGamePlayers.map(p => p.name),
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
      const playerObjects = courtToEnd.players.map((name, idx) => ({
        id: Date.now() + idx,
        name,
        skill: ["beginner", "intermediate", "advanced"][Math.floor(Math.random() * 3)],
        waitingTime: 0
      }));
      
      setQueue([...queue, ...playerObjects]);
      
      // Update court status
      setCourts(courts.map(court => {
        if (court.id === courtId) {
          return {
            ...court,
            status: "available",
            players: [],
            timeRemaining: 0
          };
        }
        return court;
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Session Dashboard</h1>
        <p className="text-muted-foreground">Manage players and courts for the current session</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
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
        
        <div className="md:col-span-2">
          <div className="grid gap-6">
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
                >
                  Assign to Free Court
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-xl font-semibold mb-4">Court Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  );
}
