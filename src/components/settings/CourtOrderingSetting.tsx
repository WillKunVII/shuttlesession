
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function CourtOrderingSetting() {
  const [courtOrdering, setCourtOrdering] = useState<"ascending" | "descending">("ascending");
  const { toast } = useToast();

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
    <div className="flex justify-between items-center border-b pb-4">
      <div>
        <h3 className="font-medium">Court Ordering</h3>
        <p className="text-sm text-muted-foreground">Order courts by number</p>
      </div>
      <div>
        <RadioGroup 
          value={courtOrdering} 
          onValueChange={handleCourtOrderingChange}
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
  );
}
