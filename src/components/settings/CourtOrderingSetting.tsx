
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function CourtOrderingSetting() {
  const [courtOrdering, setCourtOrdering] = useState<"ascending" | "descending">("ascending");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load settings on component mount
  useEffect(() => {
    const savedOrdering = localStorage.getItem("courtOrdering");
    if (savedOrdering === "ascending" || savedOrdering === "descending") {
      setCourtOrdering(savedOrdering as "ascending" | "descending");
    }
  }, []);

  // Handle court ordering change
  const handleCourtOrderingChange = (value: "ascending" | "descending") => {
    setCourtOrdering(value);
    localStorage.setItem("courtOrdering", value);
    
    // Show brief success toast
    toast({
      title: "Setting saved",
      description: "courtOrdering has been updated."
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4">
      <div>
        <h3 className="font-medium">Court Ordering</h3>
        <p className="text-sm text-muted-foreground">Order courts by number</p>
      </div>
      <div>
        <RadioGroup 
          value={courtOrdering} 
          onValueChange={handleCourtOrderingChange}
          className={`flex ${isMobile ? "flex-col space-y-2" : "space-x-2"}`}
        >
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
            <RadioGroupItem value="ascending" id="ascending" />
            <Label htmlFor="ascending" className="cursor-pointer">Ascending</Label>
          </div>
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
            <RadioGroupItem value="descending" id="descending" />
            <Label htmlFor="descending" className="cursor-pointer">Descending</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
