
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

export default function Settings() {
  const [courtOrdering, setCourtOrdering] = useState<"ascending" | "descending">("ascending");
  const [autoAssignment, setAutoAssignment] = useState<boolean>(false);
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
  }, []);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("courtOrdering", courtOrdering);
    localStorage.setItem("autoAssignment", String(autoAssignment));
    
    // Show success toast
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully."
    });
  };

  const handleEndSession = () => {
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
    <div className="space-y-6">
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
              <h3 className="font-medium">Auto-Assignment</h3>
              <p className="text-sm text-muted-foreground">Auto-assign players to courts</p>
            </div>
            <div>
              <RadioGroup 
                value={autoAssignment ? "enabled" : "disabled"}
                onValueChange={(value) => setAutoAssignment(value === "enabled")}
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
              <h3 className="font-medium">Court Ordering</h3>
              <p className="text-sm text-muted-foreground">Order courts by number</p>
            </div>
            <div>
              <RadioGroup 
                value={courtOrdering} 
                onValueChange={(value) => setCourtOrdering(value as "ascending" | "descending")}
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
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
