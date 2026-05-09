"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const tabs = [
  { path: "/dashboard",         label: "Play",    activeIcon: "/images/homeActiveIcon.png",    inactiveIcon: "/images/homeNotActiveIcon.png" },
  { path: "/dashboard/help",    label: "Help",    activeIcon: "/images/helpActiveIcon.png",    inactiveIcon: "/images/helpNotActiveIcon.png" },
  { path: "/dashboard/profile", label: "Profile", activeIcon: "/images/profileActiveIcon.png", inactiveIcon: "/images/profileNotActiveIcon.png" },
];

export const SideNav = () => {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex"
      style={{
        width: 220,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        flexDirection: "column",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "32px 16px",
        gap: 8,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 12px 28px" }}>
        <Image src="/images/favicon.png" alt="Super Awoof" width={36} height={36} style={{ borderRadius: 10, height: "auto" }} />
        <span className="font-display" style={{ fontSize: 16, color: "white" }}>Super Awoof</span>
      </div>

      {/* Nav Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 14,
                textDecoration: "none",
                background: isActive ? "var(--green-dim)" : "transparent",
                color: isActive ? "var(--green)" : "var(--muted)",
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
            >
              <Image
                src={isActive ? tab.activeIcon : tab.inactiveIcon}
                alt={tab.label}
                width={20}
                height={20}
                style={{ objectFit: "contain", opacity: isActive ? 1 : 0.5 }}
              />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--green)", flexShrink: 0,
            }}
            className="pulse-dot"
          />
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Connected</span>
        </div>

        {/* Flair Technologies Credit */}
        <a
          href="https://www.flairtechlabs.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 10,
            color: "var(--muted)",
            textDecoration: "none",
            opacity: 0.55,
            lineHeight: 1.5,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
        >
          Built by{" "}
          <span style={{ fontWeight: 700, color: "var(--green)" }}>
            Flair Technologies Limited
          </span>
        </a>
      </div>
    </aside>
  );
};
