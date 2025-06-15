
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

  const handleValueChange = (value: string) => {
    setCourtCount(parseInt(value, 10));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4">
      <div>
        <h3 className="font-medium text-foreground">Number of Courts</h3>
        <p className="text-sm text-muted-foreground">Configure the number of courts available (1-8)</p>
      </div>
      <div className="w-full sm:w-40">
        <Label className="mb-1 block text-foreground font-medium">Courts</Label>
        <Select value={courtCount.toString()} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full text-foreground">
            <span>
              {courtCount} {courtCount === 1 ? "court" : "courts"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
              <SelectItem key={number} value={number.toString()}>
                {number} {number === 1 ? 'court' : 'courts'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ... (no further changes needed) ...
