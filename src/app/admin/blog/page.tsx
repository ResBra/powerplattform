import { prisma } from "@/lib/prisma";
import { Plus, Trash2, Newspaper, Pencil, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { deleteBlogPost } from "@/app/actions/blog";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-secondary italic uppercase mb-2">Blog Beiträge</h1>
          <p className="text-slate-400 font-medium">Verwalten Sie Ihre Neuigkeiten und Fachartikel.</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary flex items-center gap-3 px-8 py-5 text-sm uppercase italic font-black">
          <Plus size={20} />
          Neuer Beitrag
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
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Beitrag</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Datum</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Newspaper size={64} />
                        <p className="font-bold italic">Noch keine Blog-Beiträge vorhanden.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  posts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-16 rounded-xl overflow-hidden relative shadow-sm bg-slate-100 flex items-center justify-center border border-black/5">
                            <img src={post.imageUrl || '/placeholder.jpg'} alt="" className="w-full h-full object-contain" />
                          </div>
                          <p className="font-black text-secondary italic tracking-tight">{post.title}</p>
                        </div>
                      </td>
                      <td className="p-8">
                        <p className="text-sm font-medium text-slate-400">{new Date(post.createdAt).toLocaleDateString('de-DE')}</p>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/blog/${post.id}`} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">
                            <Pencil size={18} />
                          </Link>
                          <form action={async () => {
                            "use server";
                            await deleteBlogPost(post.id);
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
          {posts.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-black/5 opacity-40 italic">
              Keine Blog-Beiträge vorhanden.
            </div>
          ) : (
            posts.map((post: any) => (
              <div key={post.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-black/5 shrink-0">
                    <img src={post.imageUrl || '/placeholder.jpg'} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">{new Date(post.createdAt).toLocaleDateString('de-DE')}</p>
                    <h3 className="font-black text-secondary italic uppercase text-sm leading-tight line-clamp-2">{post.title}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/admin/blog/${post.id}`} className="flex items-center justify-center py-4 bg-slate-100 text-secondary rounded-xl font-black uppercase text-[10px] tracking-widest">
                    <Pencil size={14} className="mr-2" /> Edit
                  </Link>
                  <form action={async () => {
                    "use server";
                    await deleteBlogPost(post.id);
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
