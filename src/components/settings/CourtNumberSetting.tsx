
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function CourtNumberSetting() {
  const [courtCount, setCourtCount] = useState<number>(() => {
    const savedValue = localStorage.getItem("courtCount");
    return savedValue ? parseInt(savedValue, 10) : 4; // Default to 4 courts
  });

  // Save to localStorage when value changes
  useEffect(() => {
    localStorage.setItem("courtCount", courtCount.toString());
  }, [courtCount]);

  const handleValueChange = (values: number[]) => {
    setCourtCount(values[0]);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="court-count">Number of Courts</Label>
        <span className="text-sm font-medium">{courtCount}</span>
      </div>
      <Slider 
        id="court-count"
        min={1} 
        max={8} 
        step={1} 
        value={[courtCount]} 
        onValueChange={handleValueChange} 
        className="w-full" 
      />
      <p className="text-sm text-muted-foreground">
        Configure the number of courts available (1-8)
      </p>
    </div>
  );
}
