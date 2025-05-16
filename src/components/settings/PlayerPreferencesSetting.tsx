
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { setStorageItem, getStorageItem } from "@/utils/storageUtils";

export function PlayerPreferencesSetting() {
  const [enablePreferences, setEnablePreferences] = useState<boolean>(false);

  // Load preferences setting from localStorage on mount using the shared utility
  useEffect(() => {
    const enabled = getStorageItem("enablePlayerPreferences", false);
    setEnablePreferences(enabled);
  }, []);

  // Save preferences setting to localStorage when it changes using the shared utility
  const handleToggleChange = (checked: boolean) => {
    setEnablePreferences(checked);
    setStorageItem("enablePlayerPreferences", checked);
  };

  return (
    <div className="flex justify-between items-center border-b pb-4">
      <div>
        <h3 className="font-medium">Player Preferences</h3>
        <p className="text-sm text-muted-foreground">Enable play style preferences (Open, Mixed, Ladies)</p>
      </div>
      <Switch 
        checked={enablePreferences}
        onCheckedChange={handleToggleChange}
      />
    </div>
  );
}
