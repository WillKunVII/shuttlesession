
import { useToast } from "@/hooks/use-toast";
import { CourtNumberDropdown } from "./CourtNumberDropdown";
import { useState, useEffect } from "react";

export function CourtNumberSetting() {
  const [courtCount, setCourtCount] = useState<number>(() => {
    const savedValue = localStorage.getItem("courtCount");
    return savedValue ? parseInt(savedValue, 10) : 4; // Default to 4 courts
  });
  const { toast } = useToast();

  // Save to localStorage when value changes
  useEffect(() => {
    localStorage.setItem("courtCount", courtCount.toString());
    toast({
      title: "Setting saved",
      description: "courtCount has been updated."
    });
  }, [courtCount, toast]);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4">
      <div>
        <h3 className="font-medium text-foreground">Number of Courts</h3>
        <p className="text-sm text-muted-foreground">Configure the number of courts available (1-8)</p>
      </div>
      <CourtNumberDropdown value={courtCount} onChange={setCourtCount} />
    </div>
  );
}
