
import { ScoreKeepingSetting } from "./ScoreKeepingSetting";
import { PlayerPoolSizeSetting } from "./PlayerPoolSizeSetting";
import { CourtOrderingSetting } from "./CourtOrderingSetting";
import { PlayerPreferencesSetting } from "./PlayerPreferencesSetting";
import { CourtNumberSetting } from "./CourtNumberSetting";

export function GeneralSettings() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">General Settings</h2>
      <div className="space-y-6 text-sm sm:text-base">
        <CourtNumberSetting />
        <CourtOrderingSetting />
        <PlayerPoolSizeSetting />
        <PlayerPreferencesSetting />
        <ScoreKeepingSetting />
      </div>
    </div>
  );
}
