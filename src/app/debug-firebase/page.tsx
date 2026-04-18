"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import { ShieldCheck, Activity, Database, Key, Globe, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function DebugFirebasePage() {
  const [status, setStatus] = useState<any>({
    vars: {},
    firestore: "checking",
    auth: "checking",
    errors: []
  });

  useEffect(() => {
    const checkStatus = async () => {
      const vars = {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "FEHLT",
        storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const errors: string[] = [];
      let firestoreStatus = "checking";
      
      try {
        const q = query(collection(db, "groups"), limit(1));
        await getDocs(q);
        firestoreStatus = "success";
      } catch (err: any) {
        console.error("Firestore Debug Error:", err);
        firestoreStatus = "failed";
        errors.push(`Firestore: ${err.message}`);
      }

      setStatus({
        vars,
        firestore: firestoreStatus,
        auth: auth ? "initialized" : "failed",
        errors
      });
    };

    checkStatus();
  }, []);

  const configItems = [
    { label: "API Key", value: status.vars.apiKey, icon: <Key size={18} /> },
    { label: "Auth Domain", value: status.vars.authDomain, icon: <Globe size={18} /> },
    { label: "Project ID", value: status.vars.projectId !== "FEHLT", detail: status.vars.projectId, icon: <Database size={18} /> },
    { label: "Storage Bucket", value: status.vars.storageBucket, icon: <Activity size={18} /> },
    { label: "App ID", value: status.vars.appId, icon: <ShieldCheck size={18} /> },
  ];

  return (
    <SiteLayoutClient activePage="legal">
      <div className="max-w-4xl mx-auto space-y-10 pb-32">
        <header className="space-y-4">
          <div className="flex items-center gap-4 text-primary">
             <Activity size={40} className="animate-pulse" />
             <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground leading-[0.9]">
                Diagnosis.
             </h1>
          </div>
          <p className="text-[10px] font-black uppercase text-primary italic tracking-widest">Firebase Connection Health-Check</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-card border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl">
              <h2 className="text-xl font-black italic uppercase text-foreground/40 tracking-widest">Config Status</h2>
              <div className="space-y-4">
                 {configItems.map((item) => (
                   <div key={item.label} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                         <div className={item.value ? "text-primary" : "text-red-500"}>{item.icon}</div>
                         <div>
                            <p className="text-[10px] font-black uppercase italic text-foreground/40 leading-none">{item.label}</p>
                            {item.detail && <p className="text-xs font-bold text-foreground mt-1">{item.detail}</p>}
                         </div>
                      </div>
                      {item.value ? <CheckCircle2 size={20} className="text-green-500" /> : <AlertTriangle size={20} className="text-red-500" />}
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-card border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                 <h2 className="text-xl font-black italic uppercase text-foreground/40 tracking-widest mb-6">Service Health</h2>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-black uppercase italic text-foreground">Firestore Connection</span>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic ${status.firestore === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500 animate-pulse'}`}>
                          {status.firestore}
                       </span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-black uppercase italic text-foreground">Auth Initialized</span>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic ${status.auth === 'initialized' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {status.auth}
                       </span>
                    </div>
                 </div>
              </div>

              {status.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-10 space-y-4 shadow-2xl">
                   <div className="flex items-center gap-2 text-red-500 font-black uppercase italic tracking-widest text-sm">
                      <AlertTriangle size={20} /> Error Logs
                   </div>
                   <div className="space-y-3">
                      {status.errors.map((err: string, i: number) => (
                        <p key={i} className="text-xs text-red-500/80 font-medium italic leading-relaxed bg-black/20 p-4 rounded-xl border border-red-500/10">
                           {err}
                        </p>
                      ))}
                   </div>
                   <p className="text-[9px] text-red-500/40 font-black uppercase italic tracking-widest mt-4">
                      Check Vercel Deployment Settings and Firebase Whitelist
                   </p>
                </div>
              )}

              <div className="p-10 bg-primary/5 border border-primary/10 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
                 <ShieldCheck className="text-primary" size={32} />
                 <p className="text-xs text-primary font-black uppercase italic tracking-widest">System Architecture: UNIVERSAL SERVERLESS</p>
              </div>
           </div>
        </div>
      </div>
    </SiteLayoutClient>
  );
}
