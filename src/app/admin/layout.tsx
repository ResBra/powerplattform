import { Metadata } from "next";
import AdminLayoutClient from "./layout.client";

export const metadata: Metadata = {
  title: "Admin | Power Platform Immobilien",
  description: "Verwaltungspanel",
  manifest: "/admin-manifest.json",
  appleWebApp: {
    title: "BL Admin",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-icon.png",
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
