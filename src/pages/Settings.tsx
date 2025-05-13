import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { Slider } from "@/components/ui/slider";

export default function Settings() {
  const [courtOrdering, setCourtOrdering] = useState<"ascending" | "descending">("ascending");
  const [autoAssignment, setAutoAssignment] = useState<boolean>(false);
  const [scoreKeeping, setScoreKeeping] = useState<boolean>(false);
  const [showPlayerOfSession, setShowPlayerOfSession] = useState<boolean>(false);
  const [playerPoolSize, setPlayerPoolSize] = useState<number>(8); // Default value
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load settings on component mount
  useEffect(() => {
    const savedOrdering = localStorage.getItem("courtOrdering");
    if (savedOrdering === "ascending" || savedOrdering === "descending") {
      setCourtOrdering(savedOrdering as "ascending" | "descending");
    }
    
    const savedAutoAssignment = localStorage.getItem("autoAssignment");
    if (savedAutoAssignment === "true") {
      setAutoAssignment(true);
    }
    
    const savedScoreKeeping = localStorage.getItem("scoreKeeping");
    if (savedScoreKeeping === "true") {
      setScoreKeeping(true);
    }
    
    const savedPoolSize = localStorage.getItem("playerPoolSize");
    if (savedPoolSize) {
      setPlayerPoolSize(Number(savedPoolSize));
    }
  }, []);

  // Save setting function that will be called automatically when settings change
  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
    
    // Show brief success toast
    toast({
      title: "Setting saved",
      description: `${key} has been updated.`
    });
  };

  // Handle court ordering change
  const handleCourtOrderingChange = (value: "ascending" | "descending") => {
    setCourtOrdering(value);
    saveSetting("courtOrdering", value);
  };
  
  // Handle auto assignment change
  const handleAutoAssignmentChange = (value: string) => {
    const isEnabled = value === "enabled";
    setAutoAssignment(isEnabled);
    saveSetting("autoAssignment", String(isEnabled));
  };
  
  // Handle score keeping change
  const handleScoreKeepingChange = (value: boolean) => {
    setScoreKeeping(value);
    saveSetting("scoreKeeping", String(value));
  };
  
  // Handle player pool size change
  const handlePlayerPoolSizeChange = (value: number[]) => {
    const size = value[0];
    setPlayerPoolSize(size);
    saveSetting("playerPoolSize", String(size));
  };

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
    // Clear player queue, next game data, and play history
    localStorage.removeItem("playerQueue");
    localStorage.removeItem("nextGamePlayers");
    localStorage.removeItem("playHistory");
    
    // Navigate back to splash screen
    navigate("/");
    
    // Show success toast
    toast({
      title: "Session ended",
      description: "Player data has been cleared. Member data is preserved."
    });
  };

  return (
    <div className="space-y-6 w-full col-span-full">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure application settings</p>
      </div>
      
      {/* End Session - High Priority Action */}
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
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-medium">Score Keeping</h3>
              <p className="text-sm text-muted-foreground">Track player wins and losses</p>
            </div>
            <Switch 
              checked={scoreKeeping}
              onCheckedChange={handleScoreKeepingChange}
            />
          </div>

          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-medium">Auto-Assignment</h3>
              <p className="text-sm text-muted-foreground">Auto-assign players to courts</p>
            </div>
            <div>
              <RadioGroup 
                value={autoAssignment ? "enabled" : "disabled"}
                onValueChange={handleAutoAssignmentChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enabled" id="enabled" />
                  <Label htmlFor="enabled">Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disabled" id="disabled" />
                  <Label htmlFor="disabled">Disabled</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-medium">Player Pool Size</h3>
              <p className="text-sm text-muted-foreground">Number of players eligible for the next game (6-12)</p>
            </div>
            <div className="w-1/2">
              <div className="flex flex-col space-y-4">
                <Slider 
                  value={[playerPoolSize]} 
                  min={6} 
                  max={12} 
                  step={1} 
                  onValueChange={handlePlayerPoolSizeChange}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>6</span>
                  <span className="font-medium text-primary">{playerPoolSize} players</span>
                  <span>12</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-medium">Court Ordering</h3>
              <p className="text-sm text-muted-foreground">Order courts by number</p>
            </div>
            <div>
              <RadioGroup 
                value={courtOrdering} 
                onValueChange={handleCourtOrderingChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ascending" id="ascending" />
                  <Label htmlFor="ascending">Ascending</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="descending" id="descending" />
                  <Label htmlFor="descending">Descending</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
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
