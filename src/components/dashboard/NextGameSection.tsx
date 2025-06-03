
import React from "react";
import { Button } from "@/components/ui/button";
import { NextGame } from "@/components/NextGame";
import { useDashboard } from "@/contexts/DashboardContext";

export function NextGameSection() {
  const { nextGamePlayers, generateNextGame, clearNextGame, queue, isNextGameReady } = useDashboard();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg sm:text-xl md:text-1.5xl font-semibold">Next Game</h2>
        <Button 
          variant="outline" 
          onClick={() => generateNextGame()} 
          disabled={queue.length < 4 || isNextGameReady()} 
          size="sm"
          className="text-sm sm:text-base"
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
