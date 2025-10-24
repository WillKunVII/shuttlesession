import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Court, CourtPlayer } from "@/types/DashboardTypes";
import { PlayerCardSmall } from "./PlayerCardSmall";
import { VoidGameConfirmDialog } from "./VoidGameConfirmDialog";
import { CompleteGameConfirmDialog } from "./CompleteGameConfirmDialog";

interface CourtStatusProps {
  court: Court;
  onAssign: () => void;
  onEndGame: () => void;
  nextGameReady: boolean;
  onVoidGame?: () => void;
  canVoid?: boolean;
}

export function CourtStatus({ court, onAssign, onEndGame, nextGameReady, onVoidGame, canVoid }: CourtStatusProps) {
  const isAvailable = court.status === 'available';
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") !== "false";
  
  return (
    <Card className={isAvailable ? 'border-shuttle-primary' : ''}>
      <CardHeader className="pb-2 pt-4 px-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{court.name}</h3>
            <StatusBadge isAvailable={isAvailable} />
          </div>
          
          {!isAvailable && (
            <div className="flex gap-1">
              {canVoid && onVoidGame && (
                <VoidGameButton onVoidGame={() => setVoidDialogOpen(true)} />
              )}
              <EndGameButton onEndGame={() => setCompleteDialogOpen(true)} />
            </div>
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

      {/* Void Game Confirmation Dialog */}
      {onVoidGame && (
        <VoidGameConfirmDialog
          open={voidDialogOpen}
          onOpenChange={setVoidDialogOpen}
          onConfirm={onVoidGame}
          courtName={court.name}
          players={court.players}
        />
      )}

      {/* Complete Game Confirmation Dialog */}
      <CompleteGameConfirmDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        onConfirm={onEndGame}
        courtName={court.name}
        players={court.players}
        scoreKeepingEnabled={isScoreKeepingEnabled}
      />
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

interface VoidGameButtonProps {
  onVoidGame: () => void;
}

function VoidGameButton({ onVoidGame }: VoidGameButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
      onClick={onVoidGame}
    >
      <X className="h-4 w-4 mr-1" /> Void
    </Button>
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
      className="text-green-600 hover:text-green-700 hover:bg-green-50"
      onClick={onEndGame}
    >
      <Trophy className="h-4 w-4 mr-1" /> Complete
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
