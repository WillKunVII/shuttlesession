
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface GenderRadioGroupProps {
  gender: "male" | "female";
  setGender: (gender: "male" | "female") => void;
}

export function GenderRadioGroup({ gender, setGender }: GenderRadioGroupProps) {
  return (
    <div className="space-y-2">
      <Label>Gender</Label>
      <RadioGroup value={gender} onValueChange={(value) => setGender(value as "male" | "female")}>
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
          <RadioGroupItem value="male" id="male" />
          <Label htmlFor="male" className="cursor-pointer">Male</Label>
        </div>
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
          <RadioGroupItem value="female" id="female" />
          <Label htmlFor="female" className="cursor-pointer">Female</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
