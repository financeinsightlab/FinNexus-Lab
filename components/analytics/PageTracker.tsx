"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Generates or retrieves a persistent anonymous session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = sessionStorage.getItem("fnl_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("fnl_sid", sid);
  }
  return sid;
}

export default function PageTracker() {
  const pathname = usePathname();
  const startTime = useRef<number>(Date.now());
  const lastPath = useRef<string>(pathname);

  const sendView = (path: string, durationMs: number) => {
    // Skip admin pages from being tracked
    if (path.startsWith("/admin")) return;
    const data = {
      path,
      sessionId: getSessionId(),
      durationMs,
      referrer: typeof document !== "undefined" ? document.referrer : null,
    };
    // Use sendBeacon for reliability on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", JSON.stringify(data));
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {});
    }
  };

  useEffect(() => {
    // When path changes, record time on previous path
    if (lastPath.current !== pathname) {
      const duration = Date.now() - startTime.current;
      sendView(lastPath.current, duration);
      lastPath.current = pathname;
      startTime.current = Date.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    startTime.current = Date.now();

    const handleUnload = () => {
      const duration = Date.now() - startTime.current;
      sendView(pathname, duration);
    };

    window.addEventListener("beforeunload", handleUnload);
    // Also send a heartbeat every 30s to keep duration live
    const interval = setInterval(() => {
      const duration = Date.now() - startTime.current;
      sendView(pathname, duration);
    }, 30000);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
