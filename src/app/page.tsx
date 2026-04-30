"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push("/onboarding"), 400);
        }
        return Math.min(next, 100);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        padding: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Image
          src="/images/favicon.png"
          alt="Super Awoof"
          width={88}
          height={88}
          style={{ borderRadius: 24 }}
          priority
        />
        <div style={{ textAlign: "center" }}>
          <p
            className="font-display"
            style={{ fontSize: 28, color: "white", marginBottom: 6 }}
          >
            Super Awoof
          </p>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Spin. Win. Repeat.</p>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          Loading{progress < 100 ? "..." : " complete"}
        </p>
      </div>
    </div>
  );
}
