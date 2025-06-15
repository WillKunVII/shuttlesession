
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function AutoAssignmentSetting() {
  const [autoAssignment, setAutoAssignment] = useState<boolean>(false);

  // Load settings on component mount
  useEffect(() => {
    const savedAutoAssignment = localStorage.getItem("autoAssignment");
    if (savedAutoAssignment === "true") {
      setAutoAssignment(true);
    }
  }, []);

  // Handle auto assignment change
  const handleAutoAssignmentChange = (value: string) => {
    const isEnabled = value === "enabled";
    setAutoAssignment(isEnabled);
    localStorage.setItem("autoAssignment", String(isEnabled));
  };

  return (
    <div className="flex justify-between items-center border-b pb-4">
      <div>
        <h3 className="font-medium">Auto-Assignment</h3>
        <p className="text-sm text-muted-foreground">Auto-assign players to courts</p>
      </div>
      <div>
        <RadioGroup 
          value={autoAssignment ? "enabled" : "disabled"}
          onValueChange={handleAutoAssignmentChange}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="enabled" id="enabled" />
            <Label htmlFor="enabled" className="text-foreground font-medium">Enabled</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="disabled" id="disabled" />
            <Label htmlFor="disabled" className="text-foreground font-medium">Disabled</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
