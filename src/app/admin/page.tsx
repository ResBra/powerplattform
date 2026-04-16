import { prisma } from "@/lib/prisma";
import { Home, Mail, FileText, ChevronRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [propertyCount, contactCount, blogCount, recentMessages] = await Promise.all([
    prisma.propertyListing.count(),
    prisma.contactRequest.count(),
    prisma.blogPost.count(),
    prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const stats = [
    { label: "Aktive Inserate", value: propertyCount, icon: <Home className="text-primary" />, color: "bg-primary/10" },
    { label: "Neue Anfragen", value: contactCount, icon: <Mail className="text-blue-500" />, color: "bg-blue-50" },
    { label: "Blog Beiträge", value: blogCount, icon: <FileText className="text-purple-500" />, color: "bg-purple-50" },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-secondary italic uppercase mb-2">Dashboard</h1>
        <p className="text-slate-400 font-medium">Willkommen zurück! Hier ist der Überblick für Power Platform Immobilien.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-secondary italic">{stat.value}</p>
              </div>
            </div>
            <ArrowUpRight className="text-slate-200 group-hover:text-primary transition-colors" size={24} />
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent Messages */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-secondary italic uppercase tracking-tight">Letzte Anfragen</h2>
            <Link href="/admin/messages" className="text-primary text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
              Alle sehen <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMessages.length === 0 ? (
              <p className="text-slate-400 italic text-sm py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">Noch keine Nachrichten eingegangen.</p>
            ) : (
              recentMessages.map((msg: any) => (
                <div key={msg.id} className="p-5 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-black/5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary/5 rounded-full flex items-center justify-center text-secondary font-black text-xs uppercase italic">
                      {msg.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-secondary text-sm">{msg.name}</p>
                      <p className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full">{msg.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-secondary to-slate-900 rounded-[3rem] p-10 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tight mb-4">Schnell-Aktionen</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-10">Verwalten Sie Ihre Inserate oder erstellen Sie neue Beiträge mit nur einem Klick.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Link href="/admin/properties/new" className="w-full bg-primary hover:bg-primary-light text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all italic uppercase tracking-widest text-sm shadow-lg shadow-black/20">
              Neue Immobilie <ChevronRight size={18} />
            </Link>
            <Link href="/admin/blog/new" className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all italic uppercase tracking-widest text-sm border border-white/5">
              Neuer Blog Beitrag <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
