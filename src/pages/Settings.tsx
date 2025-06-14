
import { useState, useEffect } from "react";
import { SessionControl } from "@/components/settings/SessionControl";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { PlayerOfMonthDialog } from "@/components/PlayerOfMonthDialog";
import { PrivacyNoticeDialog } from "@/components/PrivacyNoticeDialog";
// FIX: Import from shadcn/ui location for Button
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [showMonthDialog, setShowMonthDialog] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Add debug logs to track dialog open state
  useEffect(() => {
    if (showMonthDialog) {
      console.log("Settings: PlayerOfMonthDialog opened");
    } else {
      console.log("Settings: PlayerOfMonthDialog closed");
    }
  }, [showMonthDialog]);

  const handleClearData = () => {
    if (confirm("Are you sure? All app data (players, scores, history) will be deleted. This cannot be undone.")) {
      localStorage.clear();
      indexedDB.deleteDatabase("ShuttleSessionDB");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 w-full col-span-full">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-shuttle-lightBlue">Settings</h1>
        <p className="text-shuttle-lightBlue">Configure application settings</p>
      </div>
      
      {/* Session Control Section */}
      <SessionControl />
      
      {/* General Settings Section */}
      <GeneralSettings />

      {/* Player of the Month section (moved to BOTTOM) */}
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
      {/* Player of Month Dialog */}
      <PlayerOfMonthDialog
        isOpen={showMonthDialog}
        onClose={() => setShowMonthDialog(false)}
      />

      {/* Privacy & Data Section */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-2">Privacy & Data</h2>
        <Button onClick={handleClearData} className="bg-red-500 text-white mr-4">
          Clear All Data
        </Button>
        <Button onClick={() => setPrivacyOpen(true)} variant="outline">
          Privacy Notice
        </Button>
        <PrivacyNoticeDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      </section>
    </div>
  );
}
