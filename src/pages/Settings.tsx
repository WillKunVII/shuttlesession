
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
        </div>
      </div>
    </div>
  );
}
