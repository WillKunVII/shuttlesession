
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Mock settings data
const settings = [
  { id: 1, name: "Notifications", description: "Get notified about court availability", enabled: true },
  { id: 2, name: "Game Duration", description: "Default game duration", value: "15 minutes" },
  { id: 3, name: "Auto-Assignment", description: "Auto-assign players to courts", enabled: false },
];

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure application settings</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        <div className="space-y-6">
          {settings.map(setting => (
            <div key={setting.id} className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-medium">{setting.name}</h3>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <div>
                {setting.value ? (
                  <Badge variant="outline">{setting.value}</Badge>
                ) : (
                  <Badge variant={setting.enabled ? "default" : "secondary"}>
                    {setting.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-medium">Court Ordering</h3>
              <p className="text-sm text-muted-foreground">Order courts by number</p>
            </div>
            <div>
              <RadioGroup defaultValue="ascending" className="flex space-x-4">
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
        </div>
      </div>
    </div>
  );
}
