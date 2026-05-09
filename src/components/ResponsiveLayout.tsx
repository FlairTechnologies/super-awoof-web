"use client";
import React from "react";
import { SideNav } from "./SideNav";
import { TabBar } from "./TabBar";
import { usePathname } from "next/navigation";

export const ResponsiveLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isShell = pathname === "/" || pathname.startsWith("/onboarding") || pathname.startsWith("/auth");

  if (isShell) {
    // Auth & onboarding: full-screen, no nav
    return (
      <div style={{ height: "100dvh", width: "100vw", overflow: "hidden" }} className="bg-[#0D0F14]">
        {children}
      </div>
    );
  }

  // Dashboard app shell: sidebar on desktop, tab bar on mobile
  return (
    <div className="flex bg-[#0D0F14]" style={{ height: "100dvh", width: "100vw", overflow: "hidden" }}>
      <SideNav />
      <main className="flex-1 overflow-hidden" style={{ height: "100dvh" }}>
        {children}
      </main>
      <div className="md:hidden">
        {/* Flair Technologies Credit — mobile only */}
        <a
          href="https://www.flairtechlabs.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            fontSize: 9,
            color: "var(--muted)",
            opacity: 0.45,
            padding: "4px 0",
            textDecoration: "none",
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            letterSpacing: "0.03em",
          }}
        >
          Built by <strong style={{ color: "var(--green)", fontWeight: 700 }}>Flair Technologies Limited</strong>
        </a>
        <TabBar />
      </div>
    </div>
  );
};
