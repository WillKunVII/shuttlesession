
import React from "react";
import { PlayerPoolSizeSetting } from "./PlayerPoolSizeSetting";
import { CourtNumberSetting } from "./CourtNumberSetting";
import { PlayerPreferencesSetting } from "./PlayerPreferencesSetting";
import { ScoreKeepingSetting } from "./ScoreKeepingSetting";
import { PiggybackSetting } from "./PiggybackSetting";

export function GeneralSettings() {
  return (
    <div className="flex flex-col gap-6">
      <PlayerPoolSizeSetting />
      <CourtNumberSetting />
      <PlayerPreferencesSetting />
      <ScoreKeepingSetting />
      <PiggybackSetting />
    </div>
  );
}
