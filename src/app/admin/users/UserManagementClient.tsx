"use client";

import { useState } from "react";
import { createUser, deleteUser, changePassword } from "@/app/actions/users";
import { 
  UserPlus, 
  Trash2, 
  Key, 
  ShieldCheck, 
  User, 
  X, 
  Save, 
  ShieldAlert,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  username: string;
  createdAt: Date;
}

interface UserManagementClientProps {
  users: AdminUser[];
  currentUserId?: string;
}

export default function UserManagementClient({ users, currentUserId }: UserManagementClientProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const router = useRouter();

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await createUser(formData);

    setMessage({ success: result.success, text: result.message });
    setIsPending(false);
    if (result.success) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Sind Sie sicher, dass Sie diesen Admin löschen möchten?")) return;
    
    setIsPending(true);
    const result = await deleteUser(id);
    setMessage({ success: result.success, text: result.message });
    setIsPending(false);
    if (result.success) router.refresh();
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);

    setMessage({ success: result.success, text: result.message });
    setIsPending(false);
    if (result.success) (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      
      {/* 1. PASSWORT ÄNDERN */}
      <div className="space-y-6 md:space-y-8">
        <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
          <Key size={18} /> Passwort ändern
        </h2>
        
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-xl border border-black/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          
          <form onSubmit={handleChangePassword} className="relative z-10 space-y-6 md:space-y-8">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Aktuelles Passwort</label>
              <div className="relative">
                <input 
                  required 
                  name="currentPassword" 
                  type={showCurrentPassword ? "text" : "password"} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic tracking-widest text-secondary" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Neues Passwort</label>
              <div className="relative">
                <input 
                  required 
                  name="newPassword" 
                  type={showNewPassword ? "text" : "password"} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic tracking-widest text-secondary" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Bestätigen</label>
              <input 
                required 
                name="confirmPassword" 
                type={showNewPassword ? "text" : "password"} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/10 outline-none font-bold italic tracking-widest text-secondary" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full btn-primary py-4 md:py-5 text-base md:text-lg flex items-center justify-center gap-4 italic font-black uppercase"
            >
              <Save size={20} />
              {isPending ? "Speichern..." : "Aktualisieren"}
            </button>
          </form>
        </div>
      </div>

      {/* 2. ADMIN LISTE & NEUER NUTZER */}
      <div className="space-y-6 md:space-y-8">
        <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
          <ShieldCheck size={18} /> Team Verwaltung
        </h2>

        {/* Create User Form */}
        <div className="bg-slate-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-[5rem] -mr-10 -mt-10"></div>
          
          <h3 className="text-lg md:text-xl font-bold italic uppercase tracking-tight mb-8">Neuen Admin <span className="text-primary">erstellen.</span></h3>
          
          <form onSubmit={handleCreateUser} className="relative z-10 space-y-6">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-2">Benutzername</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input required name="username" type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:ring-4 focus:ring-primary/20 outline-none font-bold italic" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-2">Passwort</label>
                <input required name="password" type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/20 outline-none font-bold italic tracking-widest" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-2">Zweitpas.</label>
                <input required name="passwordConfirm" type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/20 outline-none font-bold italic tracking-widest" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-primary hover:bg-white hover:text-primary transition-all py-4 md:py-5 text-base md:text-lg flex items-center justify-center gap-4 italic font-black uppercase text-white rounded-2xl"
            >
              <UserPlus size={20} />
              {isPending ? "Erstellen..." : "Admin Hinzufügen"}
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-4">Administratoren</h3>
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-black/5 flex items-center justify-between group hover:shadow-md transition-all sm:overflow-hidden overflow-x-auto">
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 border border-black/5 rounded-2xl flex items-center justify-center text-secondary shrink-0">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black italic text-secondary uppercase tracking-tight truncate">{user.username}</p>
                    {user.id === currentUserId && (
                      <span className="text-[8px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">Ich</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic truncate">Ab {new Date(user.createdAt).toLocaleDateString('de-DE')}</p>
                </div>
              </div>

              {user.id !== currentUserId && (
                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={isPending}
                  className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all md:opacity-0 group-hover:opacity-100 disabled:opacity-50 shrink-0"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global Message Toast */}
      {message && (
        <div className={`fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 w-[90vw] md:w-auto md:max-w-md p-4 md:p-6 rounded-2xl md:rounded-3xl text-center font-bold italic z-[100] shadow-2xl animate-in slide-in-from-bottom-10 flex items-center justify-between gap-4 ${message.success ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          <div className="flex items-center gap-3 md:gap-4 truncate">
            {message.success ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
            <span className="truncate text-sm md:text-base">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="hover:scale-125 transition-transform shrink-0"><X size={18} /></button>
        </div>
      )}

    </div>
  );
}
