"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

export default function InactivityHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes in ms
  const STORAGE_KEY = "last_admin_activity";

  const handleLogout = async () => {
    localStorage.removeItem(STORAGE_KEY);
    await logout();
    router.push("/login");
    router.refresh();
  };

  const resetTimer = () => {
    const now = Date.now().toString();
    localStorage.setItem(STORAGE_KEY, now);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    // 1. Check on Load (handles refresh case)
    const lastActivity = localStorage.getItem(STORAGE_KEY);
    if (lastActivity) {
      const diff = Date.now() - parseInt(lastActivity);
      if (diff > INACTIVITY_LIMIT) {
        handleLogout();
        return;
      }
    }

    // 2. Track activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    // Initial timer start
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname]); // Also re-check on navigation

  return null;
}
