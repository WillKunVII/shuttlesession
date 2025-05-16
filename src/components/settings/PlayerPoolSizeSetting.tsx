
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

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
  const handlePlayerPoolSizeChange = (value: number[]) => {
    const size = value[0];
    setPlayerPoolSize(size);
    localStorage.setItem("playerPoolSize", String(size));
    
    // Show brief success toast
    toast({
      title: "Setting saved",
      description: "playerPoolSize has been updated."
    });
  };

  return (
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
  );
}
