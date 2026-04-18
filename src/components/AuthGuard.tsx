"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        // Redirekt zum Login mit der aktuellen URL als Rücksprungziel
        const callbackUrl = encodeURIComponent(pathname);
        router.push(`/?callbackUrl=${callbackUrl}`);
      } else {
        setUser(u);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a10] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
