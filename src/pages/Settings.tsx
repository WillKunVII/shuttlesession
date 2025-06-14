
import { useState } from "react";
import { SessionControl } from "@/components/settings/SessionControl";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { PlayerOfMonthDialog } from "@/components/PlayerOfMonthDialog";

export default function Settings() {
  const [showMonthDialog, setShowMonthDialog] = useState(false);

  return (
    <div className="space-y-6 w-full col-span-full">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-shuttle-lightBlue">Settings</h1>
        <p className="text-shuttle-lightBlue">Configure application settings</p>
      </div>
      
      {/* Player of the Month section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-yellow-300/50">
        <h2 className="text-xl font-semibold mb-2 text-yellow-700 flex items-center gap-2">
          <span role="img" aria-label="Medal">🥇</span>
          Player of the Month
        </h2>
        <p className="text-sm mb-4 text-yellow-900">
          See the all-time win rate leaders! (only shows players with at least 3 games played)
        </p>
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium rounded px-6 py-2 transition-colors shadow"
          onClick={() => setShowMonthDialog(true)}
        >
          Show Player of the Month
        </button>
      </div>

      {/* Session Control Section */}
      <SessionControl />
      
      {/* General Settings Section */}
      <GeneralSettings />

      {/* Player of Month Dialog */}
      <PlayerOfMonthDialog
        isOpen={showMonthDialog}
        onClose={() => setShowMonthDialog(false)}
      />
    </div>
  );
}
