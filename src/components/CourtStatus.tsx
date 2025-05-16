
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

interface CourtPlayer {
  name: string;
  gender: "male" | "female";
  isGuest?: boolean;
}

interface Court {
  id: number;
  name: string;
  status: 'available' | 'occupied';
  players: CourtPlayer[];
  timeRemaining: number;
}

interface CourtStatusProps {
  court: Court;
  onAssign: () => void;
  onEndGame: () => void;
  nextGameReady: boolean;
}

export function CourtStatus({ court, onAssign, onEndGame, nextGameReady }: CourtStatusProps) {
  const isAvailable = court.status === 'available';
  
  return (
    <Card className={`${isAvailable ? 'border-shuttle-primary' : ''}`}>
      <CardHeader className="pb-2 pt-4 px-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{court.name}</h3>
            <Badge variant={isAvailable ? 'default' : 'secondary'} 
                  className={isAvailable ? 'bg-shuttle-primary hover:bg-shuttle-primary/90' : ''}>
              {isAvailable ? 'Available' : 'Occupied'}
            </Badge>
          </div>
          
          {!isAvailable && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={onEndGame}
            >
              <X className="h-4 w-4 mr-1" /> End
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3 px-3">
        {isAvailable ? (
          <div className="text-center py-2">
            <Button 
              className="w-full bg-shuttle-primary hover:bg-shuttle-primary/90" 
              disabled={!nextGameReady}
              onClick={onAssign}
            >
              Assign Next Game
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {court.players.map((player, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 text-sm py-1 px-3 rounded-full bg-gray-100"
              >
                <span className={`h-2 w-2 rounded-full ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                <span>{player.name}</span>
                {player.isGuest && (
                  <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
