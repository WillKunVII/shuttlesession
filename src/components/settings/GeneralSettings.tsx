import React from "react";
import { PlayerPoolSizeSetting } from "./PlayerPoolSizeSetting";
import { CourtNumberSetting } from "./CourtNumberSetting";
import { EnablePlayPreferencesSetting } from "./EnablePlayPreferencesSetting";
import { EnableScoreKeepingSetting } from "./EnableScoreKeepingSetting";
import { PiggybackSetting } from "./PiggybackSetting";

export function GeneralSettings() {
  return (
    <div className="flex flex-col gap-6">
      <PlayerPoolSizeSetting />
      <CourtNumberSetting />
      <EnablePlayPreferencesSetting />
      <EnableScoreKeepingSetting />
      <PiggybackSetting />
    </div>
  );
}
