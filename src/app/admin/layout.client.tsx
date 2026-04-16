"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Home, 
  FileText, 
  Mail, 
  LogOut, 
  ChevronRight, 
  Users, 
  Menu, 
  X, 
  ChevronLeft,
  Globe,
  Settings,
  ShieldCheck,
  Palette
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import InactivityHandler from "@/components/InactivityHandler";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/admin/properties", label: "Immobilien", icon: <Home size={20} /> },
    { href: "/admin/team", label: "Mitarbeiter", icon: <Users size={20} /> },
    { href: "/admin/blog", label: "Blog", icon: <FileText size={20} /> },
    { href: "/admin/messages", label: "Nachrichten", icon: <Mail size={20} /> },
    { href: "/admin/email", label: "E-Mail Design", icon: <Palette size={20} /> },
    { href: "/admin/users", label: "Benutzer", icon: <ShieldCheck size={20} /> },
    { href: "/admin/settings", label: "Einstellungen", icon: <Settings size={20} /> },
  ];

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <InactivityHandler />

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${sidebarWidth} 
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-[70] transition-all duration-300 ease-in-out
        overflow-y-auto scrollbar-hide
      `}>
        {/* Toggle Button Desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-primary rounded-full items-center justify-center text-white shadow-lg z-10 hover:scale-110 transition-transform"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} h-24`}>
          <div className="w-2 h-8 bg-primary rounded-full shrink-0"></div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <span className="font-black italic uppercase tracking-widest text-lg">Admin<span className="text-primary-light">Hub</span></span>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Power Platform Immo</p>
            </div>
          )}
        </div>

        <nav className="flex-grow p-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : ""}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-4 rounded-2xl transition-all group relative ${
                  isActive 
                    ? "bg-gradient-to-r from-primary to-green-700 text-white shadow-lg shadow-primary/20" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${isActive ? 'text-white' : 'group-hover:text-primary'} transition-colors`}>
                    {link.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="font-bold text-sm tracking-tight italic whitespace-nowrap">{link.label}</span>
                  )}
                </div>
                {!isCollapsed && isActive && <ChevronRight size={16} className="text-white/50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} px-4 py-3 text-white/40 hover:text-white transition-colors text-xs font-bold italic uppercase tracking-widest`}>
            <Globe size={18} />
            {!isCollapsed && <span>Website</span>}
          </Link>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} px-4 py-3 text-red-400/60 hover:text-red-400 transition-colors text-xs font-black italic uppercase tracking-widest`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Abmelden</span>}
          </button>
        </div>
      </aside>

      {/* Header Mobile / Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white border-b border-black/5 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <span className="font-black italic uppercase tracking-widest text-sm text-secondary">Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-secondary hover:bg-slate-50 rounded-xl"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Main Content */}
      <main className={`
        flex-grow 
        ${isCollapsed ? "lg:ml-20" : "lg:ml-72"} 
        transition-all duration-300 ease-in-out
        p-4 md:p-12 mt-20 lg:mt-0
      `}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
