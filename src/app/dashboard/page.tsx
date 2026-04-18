import ClientHome from "@/components/ClientHome";
import SiteLayout from "@/components/SiteLayout";

/**
 * DASHBOARD PAGE (SERVER COMPONENT)
 * Final Cleaned Version: Removed all Prisma dependencies for a pure static export.
 * This ensures 100% compatibility with the Android Capacitor build.
 */
export default async function DashboardPage() {
  console.log("🛠️ POWER-OS: Initializing Standalone Showcase Hub...");
  
  // We provide a hardcoded settings object to satisfy the components
  // until Firestore migration is fully implemented for global settings.
  const settings = {
    platformName: "Power Platform",
    maintenanceMode: false
  };

  return (
    <SiteLayout activePage="dashboard" settings={settings}>
      <ClientHome settings={settings} />
    </SiteLayout>
  );
}
