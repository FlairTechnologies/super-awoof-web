"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/Button";

const slides = [
  {
    id: 1,
    image: "/images/slot_machine.png",
    title: "Spin to Win",
    body: "Pull the lever and stand a chance to hit the jackpot. Every spin is a new shot at earning big.",
    path: "/onboarding",
  },
  {
    id: 2,
    image: "/images/coins.png",
    title: "Coins, Then Rewards",
    body: "Every coin is a shot at the jackpot. Cash out your winnings straight to your bank, anytime.",
    path: "/onboarding/tab2",
  },
];

interface OnboardingPageProps {
  index: number;
  nextPath: string;
  nextLabel: string;
}

export function OnboardingTemplate({ index, nextPath, nextLabel }: OnboardingPageProps) {
  const router = useRouter();
  const slide = slides[index];

  return (
    <div
      className="app-screen"
      style={{
        padding: "32px 24px 24px",
        maxWidth: 520,
        margin: "0 auto",
        gap: 20,
        justifyContent: "space-between"
      }}
    >
      {/* Top – Logo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Image src="/images/favicon.png" alt="Super Awoof" width={40} height={40} style={{ borderRadius: 12, height: "auto" }} />
        <button
          onClick={() => router.push("/auth/signin")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, color: "var(--muted)", fontWeight: 500,
          }}
        >
          Skip
        </button>
      </div>

      {/* Hero Image */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 280,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(29,185,84,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div style={{ position: "relative", width: 260, height: 260 }}>
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Dots */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => router.push(s.path)}
              style={{
                height: 4,
                width: i === index ? 32 : 16,
                borderRadius: 99,
                background: i === index ? "var(--green)" : "var(--surface-2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 className="font-display" style={{ fontSize: 28, color: "white", lineHeight: 1.2 }}>
            {slide.title}
          </h1>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.6 }}>
            {slide.body}
          </p>
        </div>

        {/* CTA */}
        <Button text={nextLabel} onClick={() => router.push(nextPath)} />
      </div>
    </div>
  );
}
