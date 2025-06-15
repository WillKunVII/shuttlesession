
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getPiggybackEnabled, setPiggybackEnabled } from "@/utils/storageUtils";

export function PiggybackSetting() {
  const [checked, setChecked] = useState(getPiggybackEnabled());

  useEffect(() => {
    setPiggybackEnabled(checked);
  }, [checked]);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4">
      <div>
        <h3 className="font-medium text-foreground">Allow Piggybacking</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable the piggyback pairing feature. If disabled, piggyback actions won't be shown in player queues.
        </p>
      </div>
      <div className="w-full sm:w-40 flex items-center justify-end">
        <Label className="mr-3 text-foreground font-medium" htmlFor="piggyback-toggle">Piggybacking</Label>
        <Switch id="piggyback-toggle" checked={checked} onCheckedChange={setChecked} />
      </div>
    </div>
  );
}
