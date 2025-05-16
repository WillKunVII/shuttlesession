
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PlayerPreferencesSetting() {
  const [enablePreferences, setEnablePreferences] = useState<boolean>(false);

  // Load preferences setting from localStorage on mount
  useEffect(() => {
    const enablePref = localStorage.getItem("enablePlayerPreferences");
    setEnablePreferences(enablePref === "true");
  }, []);

  // Save preferences setting to localStorage when it changes
  const handleToggleChange = (checked: boolean) => {
    setEnablePreferences(checked);
    localStorage.setItem("enablePlayerPreferences", checked.toString());
  };

  return (
    <Card className="shadow-none border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Player Preferences</CardTitle>
        <CardDescription>
          Enable play style preferences (Open, Mixed, Ladies)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-player-preferences">Enable play preferences</Label>
          <Switch
            id="enable-player-preferences"
            checked={enablePreferences}
            onCheckedChange={handleToggleChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
