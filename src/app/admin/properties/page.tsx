import { prisma } from "@/lib/prisma";
import { Plus, Trash2, ExternalLink, Home, CheckCircle2, Clock, Pencil } from "lucide-react";
import Link from "next/link";
import { deleteProperty, togglePropertyStatus } from "@/app/actions/properties";

export default async function AdminPropertiesPage() {
  const properties = await prisma.propertyListing.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-secondary italic uppercase mb-2">Immobilien</h1>
          <p className="text-slate-400 font-medium">Verwalten Sie Ihre Portfolio-Einträge und deren Status.</p>
        </div>
        <Link href="/admin/properties/new" className="btn-primary flex items-center gap-3 px-8 py-5 text-sm uppercase italic font-black shadow-lg shadow-primary/20">
          <Plus size={20} />
          Neue Immobilie
        </Link>
      </div>
      {/* Mobile Feed / Desktop Table */}
      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-black/5">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Immobilie</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Preis/QM</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {properties.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Home size={64} />
                        <p className="font-bold italic">Noch keine Inserate vorhanden.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  properties.map((prop: any) => {
                    const ensureAbsoluteUrl = (u: string) => {
                      if (!u) return "";
                      if (u.startsWith("http://") || u.startsWith("https://")) return u;
                      return `https://${u}`;
                    };

                    return (
                      <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-8">
                          <div className="flex items-center gap-6">
                            <div className="w-24 h-20 rounded-2xl overflow-hidden relative shadow-sm bg-slate-100 flex items-center justify-center border border-black/5">
                              <img src={prop.imageUrl} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="font-black text-secondary italic tracking-tight mb-1">{prop.title}</p>
                              <p className="text-xs text-slate-400">{prop.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="space-y-1">
                            <p className="font-bold text-secondary">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(prop.price)}</p>
                            <p className="text-xs text-slate-400">{prop.sqm} m² | {prop.rooms} Zi.</p>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex flex-col gap-2">
                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full w-fit ${prop.isSold ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-400'}`}>
                               {prop.isSold ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                               Verkauft
                            </div>
                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full w-fit ${prop.isReserved ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-400'}`}>
                               {prop.isReserved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                               Reserviert
                            </div>
                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full w-fit ${prop.isRented ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-slate-100 text-slate-400'}`}>
                               {prop.isRented ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                               Vermietet
                            </div>
                          </div>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {prop.externalLink && (
                              <a href={ensureAbsoluteUrl(prop.externalLink)} target="_blank" className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">
                                <ExternalLink size={18} />
                              </a>
                            )}
                            <Link href={`/admin/properties/${prop.id}`} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">
                              <Pencil size={18} />
                            </Link>
                            <form action={async () => {
                              "use server";
                              await deleteProperty(prop.id);
                            }}>
                              <button type="submit" className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                <Trash2 size={18} />
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {properties.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-black/5 opacity-40 italic">
              Keine Inserate vorhanden.
            </div>
          ) : (
            properties.map((prop: any) => {
              const ensureAbsoluteUrl = (u: string) => {
                if (!u) return "";
                if (u.startsWith("http://") || u.startsWith("https://")) return u;
                return `https://${u}`;
              };

              return (
                <div key={prop.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-black/5 shrink-0">
                      <img src={prop.imageUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-black text-secondary italic uppercase text-sm leading-tight mb-1">{prop.title}</h3>
                      <p className="text-[10px] text-slate-400">{prop.address}</p>
                      <p className="mt-2 font-black text-primary text-base">
                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(prop.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-black/5">
                    <div className={`flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1.5 rounded-full ${prop.isSold ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-300'}`}>
                      Verkauft
                    </div>
                    <div className={`flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1.5 rounded-full ${prop.isReserved ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-50 text-slate-300'}`}>
                      Reserviert
                    </div>
                    <div className={`flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1.5 rounded-full ${prop.isRented ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-slate-50 text-slate-300'}`}>
                      Vermietet
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1.5 rounded-full bg-slate-50 text-secondary/40">
                      {prop.sqm}m² | {prop.rooms} Zi.
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link href={`/admin/properties/${prop.id}`} className="flex items-center justify-center py-4 bg-slate-100 text-secondary rounded-xl font-black uppercase text-[10px] tracking-widest">
                      <Pencil size={14} className="mr-2" /> Bearb.
                    </Link>
                    {prop.externalLink && (
                      <a href={ensureAbsoluteUrl(prop.externalLink)} target="_blank" className="flex items-center justify-center py-4 bg-slate-100 text-secondary rounded-xl font-black uppercase text-[10px] tracking-widest">
                        <ExternalLink size={14} className="mr-2" /> Link
                      </a>
                    )}
                    <form action={async () => {
                      "use server";
                      await deleteProperty(prop.id);
                    }} className="col-span-1">
                      <button type="submit" className="w-full flex items-center justify-center py-4 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest">
                        <Trash2 size={14} className="mr-2" /> Löschen
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
