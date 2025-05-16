
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function ScoreKeepingSetting() {
  const [scoreKeeping, setScoreKeeping] = useState<boolean>(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load settings on component mount
  useEffect(() => {
    const savedScoreKeeping = localStorage.getItem("scoreKeeping");
    setScoreKeeping(savedScoreKeeping !== "false");
  }, []);

  // Handle score keeping change
  const handleValueChange = (value: string) => {
    const enabled = value === "enabled";
    setScoreKeeping(enabled);
    localStorage.setItem("scoreKeeping", String(enabled));
    
    // Show brief success toast
    toast({
      title: "Setting saved",
      description: "scoreKeeping has been updated."
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4">
      <div>
        <h3 className="font-medium">Score Keeping</h3>
        <p className="text-sm text-muted-foreground">Track player wins and losses</p>
      </div>
      <RadioGroup 
        value={scoreKeeping ? "enabled" : "disabled"} 
        onValueChange={handleValueChange}
        className={`flex ${isMobile ? "flex-col space-y-2" : "space-x-4"}`}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="enabled" id="score-enabled" />
          <Label htmlFor="score-enabled">Enable</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="disabled" id="score-disabled" />
          <Label htmlFor="score-disabled">Disable</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
