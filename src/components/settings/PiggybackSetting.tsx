
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getPiggybackEnabled, setPiggybackEnabled } from "@/utils/storageUtils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function PiggybackSetting() {
  const [checked, setChecked] = useState(getPiggybackEnabled());
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleValueChange = (value: string) => {
    const enabled = value === "enabled";
    setChecked(enabled);
    setPiggybackEnabled(enabled);
    
    // Show brief success toast
    toast({
      title: "Setting saved",
      description: "Piggybacking has been updated."
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4">
      <div>
        <h3 className="font-medium text-foreground">Allow Piggybacking</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable the piggyback pairing feature. If disabled, piggyback actions won't be shown in player queues.
        </p>
      </div>
      <RadioGroup 
        value={checked ? "enabled" : "disabled"}
        onValueChange={handleValueChange}
        className={`flex ${isMobile ? "flex-col space-y-2" : "space-x-2"}`}
      >
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
          <RadioGroupItem value="enabled" id="piggyback-enabled" />
          <Label htmlFor="piggyback-enabled" className="cursor-pointer text-foreground font-medium">Enable</Label>
        </div>
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
          <RadioGroupItem value="disabled" id="piggyback-disabled" />
          <Label htmlFor="piggyback-disabled" className="cursor-pointer text-foreground font-medium">Disable</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
