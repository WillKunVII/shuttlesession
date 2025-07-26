
import { useState, useEffect } from "react";
import { SessionControl } from "@/components/settings/SessionControl";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { PrivacyNoticeDialog } from "@/components/PrivacyNoticeDialog";
import { PWAInstallSection } from "@/components/settings/PWAInstallSection";
// FIX: Import from shadcn/ui location for Button
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

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

      {/* PWA Install Section */}
      <PWAInstallSection />

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
