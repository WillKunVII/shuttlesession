import { SessionControl } from "@/components/settings/SessionControl";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
export default function Settings() {
  return <div className="space-y-6 w-full col-span-full">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-shuttle-lightBlue">Settings</h1>
        <p className="text-shuttle-lightBlue">Configure application settings</p>
      </div>
      
      {/* Session Control Section */}
      <SessionControl />
      
      {/* General Settings Section */}
      <GeneralSettings />
    </div>;
}