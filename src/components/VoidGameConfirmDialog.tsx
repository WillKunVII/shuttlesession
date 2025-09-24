import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CourtPlayer } from "@/types/DashboardTypes";

interface VoidGameConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  courtName: string;
  players: CourtPlayer[];
}

export function VoidGameConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  courtName,
  players
}: VoidGameConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-orange-600">
            Void Game on {courtName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will return the following players to the Next Game queue:
            <div className="mt-2 p-2 bg-gray-50 rounded">
              {players.map((player, idx) => (
                <div key={idx} className="text-sm font-medium">
                  • {player.name} {player.isGuest && "(Guest)"}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-orange-600">
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Void Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}