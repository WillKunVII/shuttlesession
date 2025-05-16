
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

export function CourtNumberSetting() {
  const [courtCount, setCourtCount] = useState<number>(() => {
    const savedValue = localStorage.getItem("courtCount");
    return savedValue ? parseInt(savedValue, 10) : 4; // Default to 4 courts
  });
  const { toast } = useToast();

  // Save to localStorage when value changes
  useEffect(() => {
    localStorage.setItem("courtCount", courtCount.toString());
    
    // Show brief success toast
    toast({
      title: "Setting saved",
      description: "courtCount has been updated."
    });
  }, [courtCount, toast]);

  const handleValueChange = (values: number[]) => {
    setCourtCount(values[0]);
  };

  return (
    <div className="flex justify-between items-center border-b pb-4">
      <div>
        <h3 className="font-medium">Number of Courts</h3>
        <p className="text-sm text-muted-foreground">Configure the number of courts available (1-8)</p>
      </div>
      <div className="w-1/2">
        <div className="flex flex-col space-y-4">
          <Slider 
            value={[courtCount]} 
            min={1} 
            max={8} 
            step={1} 
            onValueChange={handleValueChange}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1</span>
            <span className="font-medium text-primary">{courtCount} courts</span>
            <span>8</span>
          </div>
        </div>
      </div>
    </div>
  );
}
