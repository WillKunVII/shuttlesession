
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { setStorageItem, getStorageItem } from "@/utils/storageUtils";
import { useIsMobile } from "@/hooks/use-mobile";

export function PlayerPreferencesSetting() {
  const [enablePreferences, setEnablePreferences] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // Load preferences setting from localStorage on mount using the shared utility
  useEffect(() => {
    const enabled = getStorageItem("enablePlayerPreferences", false);
    setEnablePreferences(enabled);
  }, []);

  // Save preferences setting to localStorage when it changes using the shared utility
  const handleValueChange = (value: string) => {
    const enabled = value === "enabled";
    setEnablePreferences(enabled);
    setStorageItem("enablePlayerPreferences", enabled);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4">
      <div>
        <h3 className="font-medium">Player Preferences</h3>
        <p className="text-sm text-muted-foreground">Enable play style preferences (Open, Mixed, Ladies)</p>
      </div>
      <RadioGroup 
        value={enablePreferences ? "enabled" : "disabled"}
        onValueChange={handleValueChange}
        className={`flex ${isMobile ? "flex-col space-y-2" : "space-x-2"}`}
      >
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
          <RadioGroupItem value="enabled" id="preferences-enabled" />
          <Label htmlFor="preferences-enabled" className="cursor-pointer">Enable</Label>
        </div>
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
          <RadioGroupItem value="disabled" id="preferences-disabled" />
          <Label htmlFor="preferences-disabled" className="cursor-pointer">Disable</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
