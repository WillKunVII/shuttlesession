
import React from "react";
import { Button } from "@/components/ui/button";
import { NextGame } from "@/components/NextGame";
import { useDashboard } from "@/contexts/DashboardContext";

export function NextGameSection() {
  const { nextGamePlayers, generateNextGame, clearNextGame, queue } = useDashboard();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Next Game</h2>
        <Button 
          variant="outline" 
          onClick={() => generateNextGame()} 
          disabled={queue.length < 4} 
          size="sm"
        >
          Auto-Select Players
        </Button>
      </div>
      <NextGame 
        players={nextGamePlayers} 
        onClear={() => clearNextGame()} 
      />
    </div>
  );
}
