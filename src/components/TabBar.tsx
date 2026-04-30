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

export const TabBar = () => {
  const pathname = usePathname();

  return (
    <div
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        paddingBottom: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <Link
            key={tab.path}
            href={tab.path}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              textDecoration: "none",
              padding: "8px 20px",
              borderRadius: 12,
              color: isActive ? "var(--green)" : "var(--muted)",
            }}
          >
            <Image
              src={isActive ? tab.activeIcon : tab.inactiveIcon}
              alt={tab.label}
              width={22}
              height={22}
              style={{ objectFit: "contain", opacity: isActive ? 1 : 0.4 }}
            />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
