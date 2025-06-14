import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Court, CourtPlayer } from "@/types/DashboardTypes";
import { PlayerCardSmall } from "./PlayerCardSmall";

interface CourtStatusProps {
  court: Court;
  onAssign: () => void;
  onEndGame: () => void;
  nextGameReady: boolean;
}

export function CourtStatus({ court, onAssign, onEndGame, nextGameReady }: CourtStatusProps) {
  const isAvailable = court.status === 'available';
  
  return (
    <Card className={isAvailable ? 'border-shuttle-primary' : ''}>
      <CardHeader className="pb-2 pt-4 px-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{court.name}</h3>
            <StatusBadge isAvailable={isAvailable} />
          </div>
          
          {!isAvailable && (
            <EndGameButton onEndGame={onEndGame} />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3 px-3">
        {isAvailable ? (
          <AssignGameButton onAssign={onAssign} nextGameReady={nextGameReady} />
        ) : (
          <PlayersList players={court.players} />
        )}
      </CardContent>
    </Card>
  );
}

interface StatusBadgeProps {
  isAvailable: boolean;
}

function StatusBadge({ isAvailable }: StatusBadgeProps) {
  return (
    <Badge 
      variant={isAvailable ? 'default' : 'secondary'} 
      className={isAvailable ? 'bg-shuttle-primary hover:bg-shuttle-primary/90' : ''}
    >
      {isAvailable ? 'Available' : 'Occupied'}
    </Badge>
  );
}

interface EndGameButtonProps {
  onEndGame: () => void;
}

function EndGameButton({ onEndGame }: EndGameButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={onEndGame}
    >
      <X className="h-4 w-4 mr-1" /> End
    </Button>
  );
}

interface AssignGameButtonProps {
  onAssign: () => void;
  nextGameReady: boolean;
}

function AssignGameButton({ onAssign, nextGameReady }: AssignGameButtonProps) {
  return (
    <div className="text-center py-2">
      <Button 
        className="w-full bg-shuttle-primary hover:bg-shuttle-primary/90" 
        disabled={!nextGameReady}
        onClick={onAssign}
      >
        Assign Next Game
      </Button>
    </div>
  );
}

interface PlayersListProps {
  players: CourtPlayer[];
}

function PlayersList({ players }: PlayersListProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {players.map((player, idx) => (
        <PlayerCardSmall
          key={idx}
          player={player}
        />
      ))}
    </div>
  );
}

interface PlayerTagProps {
  player: CourtPlayer;
}

function PlayerTag({ player }: PlayerTagProps) {
  return (
    <div className="flex items-center gap-2 text-sm py-1 px-3 rounded-full bg-gray-100">
      <span className={`h-2 w-2 rounded-full ${player.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
      <span>{player.name}</span>
      {player.isGuest && (
        <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
      )}
    </div>
  );
}
