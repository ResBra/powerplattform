import { prisma } from "@/lib/prisma";
import SiteLayoutClient from "./SiteLayoutClient";

interface SiteLayoutProps {
  children: React.ReactNode;
  activePage?: string;
  settings?: any; // Allow passing settings if already fetched
}

export default async function SiteLayout({ children, activePage, settings: passedSettings }: SiteLayoutProps) {
  // Fetch settings if not passed as prop
  const settings = passedSettings || await prisma.globalSettings.findUnique({
    where: { id: "global" }
  });

  return (
    <SiteLayoutClient activePage={activePage} settings={settings}>
      {children}
    </SiteLayoutClient>
  );
}
