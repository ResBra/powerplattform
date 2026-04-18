import SiteLayoutClient from "./SiteLayoutClient";

interface SiteLayoutProps {
  children: React.ReactNode;
  activePage?: string;
  settings?: any; // Allow passing settings if already fetched
}

export default async function SiteLayout({ children, activePage, settings: passedSettings }: SiteLayoutProps) {
  // We use the passed settings or a default object to ensure serverless compatibility
  const settings = passedSettings || {
    platformName: "Power Platform",
    maintenanceMode: false
  };

  return (
    <SiteLayoutClient activePage={activePage} settings={settings}>
      {children}
    </SiteLayoutClient>
  );
}
