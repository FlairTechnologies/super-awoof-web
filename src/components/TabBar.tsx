"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Gamepad2, Wallet, HelpCircle, User } from "lucide-react";

const tabs = [
  { path: "/dashboard",         label: "Play",    icon: Gamepad2 },
  { path: "/dashboard/wallet",  label: "Wallet",  icon: Wallet },
  { path: "/dashboard/help",    label: "Help",    icon: HelpCircle },
  { path: "/dashboard/profile", label: "Profile", icon: User },
];

export const TabBar = () => {
  const pathname = usePathname();

  return (
    <div
      className="mobile-only"
      style={{
        position: "fixed",
        // Sits above the iOS home indicator rather than under it.
        bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        left: 16,
        right: 16,
        height: 72,
        background: "var(--surface)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--border)",
        borderRadius: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        zIndex: 100,
        boxShadow: "var(--glass-shadow)",
        padding: "0 8px",
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.path}
            href={tab.path}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: 24,
              color: isActive ? "var(--green)" : "var(--muted)",
              background: isActive ? "var(--green-dim)" : "transparent",
              transition: "all 0.3s ease",
            }}
          >
            <Icon
              size={22}
              style={{
                opacity: isActive ? 1 : 0.5,
                filter: isActive ? "drop-shadow(0 0 8px var(--green-glow))" : "none",
                transition: "all 0.3s ease",
              }}
            />
            <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
