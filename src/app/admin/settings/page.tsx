import { getGlobalSettings } from "@/app/actions/settings";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const settings = await getGlobalSettings();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-secondary italic uppercase mb-2">System-<span className="text-primary italic">Einstellungen.</span></h1>
        <p className="text-slate-400 font-medium font-bold italic">Verwalten Sie Kontaktinfos, Social Media Links und die E-Mail Konfiguration.</p>
      </div>
      
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
