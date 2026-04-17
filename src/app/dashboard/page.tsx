import { prisma } from "@/lib/prisma";
import ClientHome from "@/components/ClientHome";
import SiteLayout from "@/components/SiteLayout";



export default async function DashboardPage() {
  console.log("🛠️ OS DEBUG: Initializing High-Speed DB Engine...");
  
  try {
    const [managers, staff, blogPosts, properties, settings] = await Promise.all([
      prisma.teamMember.findMany({ 
        where: { isManager: true }, 
        orderBy: { order: "asc" } 
      }),
      prisma.teamMember.findMany({ 
        where: { isManager: false }, 
        orderBy: { order: "asc" } 
      }),
      prisma.blogPost.findMany({ 
        where: { published: true }, 
        orderBy: { createdAt: "desc" }, 
        take: 4 
      }),
      prisma.propertyListing.findMany({
         take: 3,
         orderBy: { createdAt: 'desc' }
      }),
      prisma.globalSettings.findUnique({
        where: { id: "global" }
      })
    ]);

    return (
      <SiteLayout activePage="dashboard" settings={settings}>
        <ClientHome 
          managers={managers} 
          staff={staff} 
          blogPosts={blogPosts}
          properties={properties}
          settings={settings}
        />
      </SiteLayout>
    );
  } catch (error: any) {
    console.error("❌ CRITICAL DB ERROR:", error.message);
    return (
      <div className="p-20 text-red-500 font-mono bg-black min-h-screen">
        <h1 className="text-4xl font-black mb-4 uppercase italic">Fatal System Error</h1>
        <p className="mb-8 text-xl">Die Datenbank-Synchronisierung ist fehlgeschlagen.</p>
        <div className="p-8 border border-red-500/50 rounded-3xl bg-red-500/10">
           <p className="font-black mb-2 uppercase text-[10px] tracking-widest opacity-50">Error Log:</p>
           <p className="text-sm">{error.message}</p>
        </div>
        <p className="mt-8 text-white/20 italic">Bitte starte den Server mit `npm run dev` neu, falls dieser Fehler bestehen bleibt.</p>
      </div>
    );
  }
}
