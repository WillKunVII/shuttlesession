
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function PlayerPoolSizeSetting() {
  const [playerPoolSize, setPlayerPoolSize] = useState<number>(8); // Default value
  const { toast } = useToast();

  // Load settings on component mount
  useEffect(() => {
    const savedPoolSize = localStorage.getItem("playerPoolSize");
    if (savedPoolSize) {
      setPlayerPoolSize(Number(savedPoolSize));
    }
  }, []);

  // Handle player pool size change
  const handleValueChange = (value: string) => {
    const size = parseInt(value, 10);
    setPlayerPoolSize(size);
    localStorage.setItem("playerPoolSize", String(size));
    
    // Show brief success toast
    toast({
      title: "Setting saved",
      description: "playerPoolSize has been updated."
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4">
      <div>
        <h3 className="font-medium text-foreground">Player Pool Size</h3>
        <p className="text-sm text-muted-foreground">Number of players eligible for the next game (6-12)</p>
      </div>
      <div className="w-full sm:w-40">
        <Label className="mb-1 block text-foreground font-medium">Pool Size</Label>
        <Select value={playerPoolSize.toString()} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full text-foreground">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {[6, 7, 8, 9, 10, 11, 12].map((number) => (
              <SelectItem key={number} value={number.toString()}>
                {number} players
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ... (no further changes needed) ...
