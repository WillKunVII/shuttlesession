
import { ScoreKeepingSetting } from "./ScoreKeepingSetting";
import { AutoAssignmentSetting } from "./AutoAssignmentSetting";
import { PlayerPoolSizeSetting } from "./PlayerPoolSizeSetting";
import { CourtOrderingSetting } from "./CourtOrderingSetting";

export function GeneralSettings() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">General Settings</h2>
      <div className="space-y-6">
        <ScoreKeepingSetting />
        <AutoAssignmentSetting />
        <PlayerPoolSizeSetting />
        <CourtOrderingSetting />
      </div>
    </div>
  );
}
