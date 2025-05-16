import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function ScoreKeepingSetting() {
  const [scoreKeeping, setScoreKeeping] = useState<boolean>(false);
  const { toast } = useToast();

  // Load settings on component mount
  useEffect(() => {
    const savedScoreKeeping = localStorage.getItem("scoreKeeping");
    setScoreKeeping(savedScoreKeeping !== "false");
  }, []);

  // Handle score keeping change
  const handleScoreKeepingChange = (value: boolean) => {
    setScoreKeeping(value);
    localStorage.setItem("scoreKeeping", String(value));
    
    // Show brief success toast
    toast({
      title: "Setting saved",
      description: "scoreKeeping has been updated."
    });
  };

  return (
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
  );
}
