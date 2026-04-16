import { prisma } from "@/lib/prisma";
import { Plus, Trash2, User, Users, CheckCircle2, Pencil } from "lucide-react";
import Link from "next/link";
import { deleteTeamMember } from "@/app/actions/team";

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-secondary italic uppercase mb-2">Mitarbeiter</h1>
          <p className="text-slate-400 font-medium">Verwalten Sie Ihr Team und die Rollenverteilung.</p>
        </div>
        <Link href="/admin/team/new" className="btn-primary flex items-center gap-3 px-8 py-5 text-sm uppercase italic font-black">
          <Plus size={20} />
          Neuer Mitarbeiter
        </Link>
      </div>

      {/* Mobile Feed / Desktop Table */}
      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-black/5">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Name / Position</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Kontakt</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Users size={64} />
                        <p className="font-bold italic">Noch keine Mitarbeiter in der Datenbank.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member: any) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-full overflow-hidden relative shadow-md">
                            <img src={member.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-black text-secondary italic tracking-tight">{member.name}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">{member.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="space-y-1 text-sm">
                          <p className="text-secondary font-medium">{member.email}</p>
                          <p className="text-slate-400">{member.phone}</p>
                        </div>
                      </td>
                      <td className="p-8">
                        {member.isManager && (
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit">
                             <CheckCircle2 size={12} /> Geschäftsführer
                          </span>
                        )}
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/team/${member.id}`} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">
                            <Pencil size={18} />
                          </Link>
                          <form action={async () => {
                            "use server";
                            await deleteTeamMember(member.id);
                          }}>
                            <button type="submit" className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                              <Trash2 size={18} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {members.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-black/5 opacity-40 italic">
              Keine Mitarbeiter vorhanden.
            </div>
          ) : (
            members.map((member: any) => (
              <div key={member.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden shadow-md shrink-0">
                    <img src={member.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-black text-secondary italic uppercase text-sm leading-tight mb-1">{member.name}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">{member.position}</p>
                    {member.isManager && (
                      <span className="inline-block mt-2 text-[8px] font-black uppercase px-2 py-1 rounded-md bg-primary/10 text-primary">Chef</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-black/5">
                  <p className="text-xs text-secondary font-medium flex items-center gap-2 italic">
                    <span className="text-primary opacity-40 font-black">E:</span> {member.email}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-2 italic">
                    <span className="text-primary opacity-40 font-black">P:</span> {member.phone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/admin/team/${member.id}`} className="flex items-center justify-center py-4 bg-slate-100 text-secondary rounded-xl font-black uppercase text-[10px] tracking-widest">
                    <Pencil size={14} className="mr-2" /> Edit
                  </Link>
                  <form action={async () => {
                    "use server";
                    await deleteTeamMember(member.id);
                  }} className="w-full">
                    <button type="submit" className="w-full flex items-center justify-center py-4 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest">
                      <Trash2 size={14} className="mr-2" /> Delete
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
