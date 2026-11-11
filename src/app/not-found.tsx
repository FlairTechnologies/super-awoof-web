"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * A real 404. Previously any unknown URL fell through to the sign-in screen,
 * which reads as "you are logged out" rather than "that page does not exist"
 * -- and quietly turned every mistyped or stale ad link into a dead end.
 */
export default function NotFound() {
  return (
    <div className="auth-screen">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 20,
          maxWidth: 420,
        }}
      >
        <Image src="/images/favicon.png" alt="Super Awoof" width={72} height={72} style={{ borderRadius: 20 }} />

        <h1 className="font-display" style={{ fontSize: 30, color: "white" }}>
          Page not found
        </h1>

        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
          That link does not lead anywhere. It may be out of date, or typed
          slightly wrong.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", marginTop: 4 }}>
          <Link href="/subscribe" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Subscribe and play
          </Link>
          <Link
            href="/auth/signin"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              fontSize: 14,
              color: "var(--green)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
