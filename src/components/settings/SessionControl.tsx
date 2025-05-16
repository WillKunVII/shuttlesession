import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlayerOfSessionDialog } from "@/components/PlayerOfSessionDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SessionControl() {
  const [showPlayerOfSession, setShowPlayerOfSession] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if score keeping is enabled
  const scoreKeeping = localStorage.getItem("scoreKeeping") !== "false";

  const handleEndSession = () => {
    // Show Player of Session dialog if score keeping is enabled
    if (scoreKeeping) {
      setShowPlayerOfSession(true);
    } else {
      // Otherwise, just end the session immediately
      finishEndSession();
    }
  };

  const finishEndSession = () => {
    // Clear player queue and next game data
    localStorage.removeItem("playerQueue");
    localStorage.removeItem("nextGamePlayers");
    
    // Navigate back to splash screen
    navigate("/");
    
    // Show success toast
    toast({
      title: "Session ended",
      description: "Player data has been cleared. Member data is preserved."
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-destructive/30">
      <h2 className="text-xl font-semibold mb-4 text-destructive">Session Control</h2>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">End the current badminton session and return to the start screen</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="lg" className="w-full sm:w-auto">End Session</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Current Session?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to end the current session and return to the start screen. 
                This action will clear all player queue data but preserve member information.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleEndSession}>
                End Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Player of Session Dialog */}
      <PlayerOfSessionDialog 
        isOpen={showPlayerOfSession} 
        onClose={() => {
          setShowPlayerOfSession(false);
          finishEndSession();
        }} 
      />
    </div>
  );
}
