
import React from "react";
import { GeneralSettings } from "./GeneralSettings";

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
        <h2 className="text-xl font-semibold mb-4">Session Settings</h2>
        <GeneralSettings />
      </div>
    </div>
  );
};
