"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SYMBOLS = [
  "/images/icon1.png",
  "/images/icon2.png",
  "/images/icon3.png",
  "/images/icon4.png",
  "/images/icon5.png",
  "/images/icon6.png",
  "/images/icon7.png",
];

const REEL_COUNT = 3;
const rnd = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

interface SlotMachineProps {
  coins: number;
  onNoCoins: () => void;
  onSpin: () => void;
}

export const SlotMachine = ({ coins, onNoCoins, onSpin }: SlotMachineProps) => {
  const [reels, setReels] = useState<string[][]>(
    Array.from({ length: REEL_COUNT }, () => [rnd(), rnd(), rnd()])
  );
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/audio/winning_slot.wav");
  }, []);

  const spin = async () => {
    if (coins <= 0) { onNoCoins(); return; }
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    onSpin();

    const interval = setInterval(() => {
      setReels(Array.from({ length: REEL_COUNT }, () => [rnd(), rnd(), rnd()]));
    }, 70);

    setTimeout(() => {
      clearInterval(interval);
      const finalReels = Array.from({ length: REEL_COUNT }, () => [rnd(), rnd(), rnd()]);
      setReels(finalReels);
      const middleRow = finalReels.map((r) => r[1]);
      const isWin = middleRow.every((s) => s === middleRow[0]);
      setResult(isWin ? "win" : "lose");
      if (isWin && audioRef.current) audioRef.current.play().catch(() => {});
      setTimeout(() => setResult(null), 3000);
      setSpinning(false);
    }, 1800);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
        width: "100%",
        maxWidth: 520,
      }}
    >
      {/* Slot Frame */}
      <div
        style={{
          width: "100%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 28,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Win Banner */}
        {result === "win" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(13,15,20,0.85)",
              backdropFilter: "blur(8px)",
            }}
            className="anim-fade-up"
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--green)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                Jackpot 🎉
              </p>
              <p className="font-display" style={{ fontSize: 48, color: "white" }}>You Won!</p>
            </div>
          </div>
        )}

        {/* Background image */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/2.5", overflow: "hidden" }}>
          <Image
            src="/images/Slot_Bg.png"
            alt="Slot Background"
            fill
            style={{ objectFit: "cover", opacity: 0.15 }}
          />

          {/* Win line */}
          <div
            style={{
              position: "absolute",
              left: 0, right: 0,
              top: "50%", transform: "translateY(-50%)",
              height: 2,
              background: "linear-gradient(90deg, transparent, rgba(29,185,84,0.5), transparent)",
            }}
          />

          {/* Reels */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "16px 24px",
            }}
          >
            {reels.map((reel, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                {reel.map((symbol, j) => (
                  <div
                    key={j}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      maxWidth: 96,
                      borderRadius: 16,
                      background: j === 1 ? "rgba(29,185,84,0.08)" : "rgba(255,255,255,0.03)",
                      border: j === 1 ? "1.5px solid rgba(29,185,84,0.25)" : "1px solid transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: j === 1 ? "scale(1.08)" : "scale(0.88)",
                      transition: "all 0.2s ease",
                      opacity: j === 1 ? 1 : 0.45,
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={symbol}
                      alt="symbol"
                      width={52}
                      height={52}
                      style={{
                        objectFit: "contain",
                        filter: spinning ? "blur(3px)" : "none",
                        transition: "filter 0.1s",
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
        <button
          onClick={spin}
          disabled={spinning}
          className="btn btn-primary"
          style={{ fontSize: 18, letterSpacing: "0.06em" }}
        >
          {spinning ? (
            <div className="spinner" />
          ) : (
            "Spin"
          )}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            1 coin per spin
          </span>
          <span style={{ color: "var(--border)" }}>•</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {coins} coin{coins !== 1 ? "s" : ""} left
          </span>
        </div>
      </div>
    </div>
  );
};
