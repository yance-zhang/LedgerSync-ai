import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <section className="simple-workspace-page">
      <p className="eyebrow">YOUR PREFERENCES</p>
      <h1>Settings</h1>
      <p className="welcome-subtitle">Account and workspace preferences.</p>
      <div className="simple-empty-state"><span className="empty-file-icon"><Settings size={23} /></span><h2>Your workspace settings are on the way.</h2><p>Account preferences will be available here.</p></div>
    </section>
  );
}
