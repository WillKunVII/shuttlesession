
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlayPreference } from "@/types/member";

interface PlayPreferencesSelectorProps {
  gender: "male" | "female";
  playPreferences: PlayPreference[];
  togglePreference: (preference: PlayPreference) => void;
}

export function PlayPreferencesSelector({ gender, playPreferences, togglePreference }: PlayPreferencesSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Play Preferences</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
          <Checkbox
            id="open-play"
            checked={playPreferences.includes("Open")}
            onCheckedChange={() => togglePreference("Open")}
          />
          <Label htmlFor="open-play" className="cursor-pointer">Open Play (any combination)</Label>
        </div>
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
          <Checkbox
            id="mixed-play"
            checked={playPreferences.includes("Mixed")}
            onCheckedChange={() => togglePreference("Mixed")}
          />
          <Label htmlFor="mixed-play" className="cursor-pointer">Mixed Play (male/female pairs)</Label>
        </div>
        {gender === "female" && (
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
            <Checkbox
              id="ladies-play"
              checked={playPreferences.includes("Ladies")}
              onCheckedChange={() => togglePreference("Ladies")}
            />
            <Label htmlFor="ladies-play" className="cursor-pointer">Ladies Play (females only)</Label>
          </div>
        )}
      </div>
    </div>
  );
}
