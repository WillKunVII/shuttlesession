
import React from "react";
import { PlayerPoolSizeSetting } from "./PlayerPoolSizeSetting";
import { CourtNumberSetting } from "./CourtNumberSetting";
import { PlayerPreferencesSetting } from "./PlayerPreferencesSetting";
import { ScoreKeepingSetting } from "./ScoreKeepingSetting";
import { PiggybackSetting } from "./PiggybackSetting";

interface PreSessionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreSessionSettings: React.FC<PreSessionSettingsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg"
          aria-label="Close"
        >×</button>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Session Settings</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Configure session settings as required before starting your session.
        </p>
        <div className="bg-white rounded-xl shadow-sm p-4 border mb-2">
          <h3 className="text-lg font-semibold mb-3 text-foreground">General Game Settings</h3>
          <div className="flex flex-col gap-5">
            <PlayerPoolSizeSetting />
            <CourtNumberSetting />
            <PlayerPreferencesSetting />
            <ScoreKeepingSetting />
            <PiggybackSetting />
          </div>
        </div>
      </div>
    </div>
  );
};
