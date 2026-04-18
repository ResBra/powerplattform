import { prisma } from "@/lib/prisma";
import ClientHome from "@/components/ClientHome";
import SiteLayout from "@/components/SiteLayout";

/**
 * DASHBOARD PAGE (SERVER COMPONENT)
 * Bereinigte Version: Entfernt alle ungenutzten Prisma-Daten, die zu Serialisierungs-Fehlern führten.
 */
export default async function DashboardPage() {
  console.log("🛠️ POWER-OS: Initializing Optimized Showcase Engine...");
  
  try {
    // Wir laden NUR noch die globalen Einstellungen, da das Showcase-Dashboard 
    // keine statischen Team- oder Blogdaten mehr benötigt.
    const settings = await prisma.globalSettings.findUnique({
      where: { id: "global" }
    });

    return (
      <SiteLayout activePage="dashboard" settings={settings}>
        <ClientHome settings={settings} />
      </SiteLayout>
    );
  } catch (error: any) {
    console.error("❌ CRITICAL DB ERROR:", error.message);
    return (
      <div className="p-20 text-red-500 font-mono bg-black min-h-screen">
        <h1 className="text-4xl font-black mb-4 uppercase italic">Fatal System Error</h1>
        <p className="mb-8 text-xl">Die System-Initialisierung ist fehlgeschlagen.</p>
        <div className="p-8 border border-red-500/50 rounded-3xl bg-red-500/10">
           <p className="font-black mb-2 uppercase text-[10px] tracking-widest opacity-50">Error Log:</p>
           <p className="text-sm">{error.message}</p>
        </div>
        <p className="mt-8 text-white/20 italic">Bitte starte den Server neu: `npm run dev`</p>
      </div>
    );
  }
}
