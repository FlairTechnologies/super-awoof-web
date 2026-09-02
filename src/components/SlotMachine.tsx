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
const ROW_COUNT = 3;
const REELS_KEY = "slotReels";
const rnd = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

/**
 * The board the server renders. Fixed, so the prerendered HTML and the first
 * client render agree; the real board is restored on mount.
 */
const PLACEHOLDER_REELS: string[][] = [
  [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
  [SYMBOLS[3], SYMBOLS[4], SYMBOLS[5]],
  [SYMBOLS[6], SYMBOLS[0], SYMBOLS[1]],
];

const rowIsAligned = (reels: string[][], row: number) =>
  reels.every((reel) => reel[row] === reels[0][row]);

const hasAlignedRow = (reels: string[][]) =>
  Array.from({ length: ROW_COUNT }, (_, row) => row).some((row) => rowIsAligned(reels, row));

/**
 * An at-rest board. Three matching icons is what a win looks like, so a board
 * the player did not spin for must never show one - redraw until no row lines
 * up. Only the middle row pays, but any lined-up row reads as a win.
 */
const makeIdleReels = (): string[][] => {
  let reels: string[][];
  do {
    reels = Array.from({ length: REEL_COUNT }, () => [rnd(), rnd(), rnd()]);
  } while (hasAlignedRow(reels));
  return reels;
};

const isValidBoard = (value: unknown): value is string[][] =>
  Array.isArray(value) &&
  value.length === REEL_COUNT &&
  value.every(
    (reel) =>
      Array.isArray(reel) &&
      reel.length === ROW_COUNT &&
      reel.every((symbol) => SYMBOLS.includes(symbol))
  );

/**
 * The board carries across page changes and reloads, so the machine looks like
 * the same machine the player left. A stored winning board is not restored -
 * it would show a jackpot with no spin behind it.
 */
const readStoredReels = (): string[][] | null => {
  try {
    const raw = localStorage.getItem(REELS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidBoard(parsed) || hasAlignedRow(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const storeReels = (reels: string[][]) => {
  try {
    localStorage.setItem(REELS_KEY, JSON.stringify(reels));
  } catch {
    // A blocked or full localStorage only costs us the remembered board.
  }
};

interface SlotMachineProps {
  coins: number;
  onNoCoins: () => void;
  onSpin: () => Promise<{ isWin: boolean; reels: string[][]; amount: number } | null>;
}

export const SlotMachine = ({ coins, onNoCoins, onSpin }: SlotMachineProps) => {
  const [reels, setReels] = useState<string[][]>(PLACEHOLDER_REELS);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeReelsRef = useRef<boolean[]>([false, false, false]);
  const [activeReels, setActiveReelsState] = useState<boolean[]>([false, false, false]);

  const setActiveReels = (newVal: boolean[]) => {
    activeReelsRef.current = newVal;
    setActiveReelsState(newVal);
  };

  useEffect(() => {
    audioRef.current = new Audio("/audio/winning_slot.wav");
  }, []);

  // Restore the board the player last saw, or draw a fresh non-winning one.
  // Runs after mount so the prerendered markup is never randomised underneath.
  useEffect(() => {
    const restored = readStoredReels();
    if (restored) {
      setReels(restored);
      return;
    }
    const fresh = makeIdleReels();
    setReels(fresh);
    storeReels(fresh);
  }, []);

  const playSynthSound = (type: "spin" | "stop") => {
    if (typeof window === "undefined") return null;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return null;
    try {
      const ctx = new AudioContext();
      if (type === "stop") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === "spin") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 14;
        lfoGain.gain.value = 25;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        return {
          stop: () => {
            try {
              osc.stop();
              lfo.stop();
              ctx.close();
            } catch {}
          }
        };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const spin = async () => {
    if (coins <= 0) { onNoCoins(); return; }
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    setActiveReels([true, true, true]);
    const spinSoundInstance = playSynthSound("spin");

    const interval = setInterval(() => {
      setReels((prev) =>
        prev.map((reel, idx) => (activeReelsRef.current[idx] ? [rnd(), rnd(), rnd()] : reel))
      );
    }, 80);

    try {
      const res = await onSpin();
      if (!res || !res.reels) throw new Error("Invalid spin result");

      // Reel 1 stops
      await new Promise((resolve) => setTimeout(resolve, 800));
      setActiveReels([false, true, true]);
      playSynthSound("stop");
      setReels((prev) => [res.reels[0], prev[1], prev[2]]);

      // Reel 2 stops
      await new Promise((resolve) => setTimeout(resolve, 400));
      setActiveReels([false, false, true]);
      playSynthSound("stop");
      setReels((prev) => [prev[0], res.reels[1], prev[2]]);

      // Reel 3 stops
      await new Promise((resolve) => setTimeout(resolve, 400));
      setActiveReels([false, false, false]);
      clearInterval(interval);
      spinSoundInstance?.stop();
      playSynthSound("stop");
      setReels((prev) => [prev[0], prev[1], res.reels[2]]);

      storeReels(res.reels);
      setResult(res.isWin ? "win" : "lose");
      if (res.isWin && audioRef.current) audioRef.current.play().catch(() => {});
      setTimeout(() => setResult(null), 3000);
    } catch (err) {
      clearInterval(interval);
      spinSoundInstance?.stop();
      setActiveReels([false, false, false]);
      setResult("lose");
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        width: "100%",
        maxWidth: 520,
        scale: "0.9", // Slightly scale down to ensure it fits on all mobile screens
      }}
      className="mobile-compact-slot"
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
                className={activeReels[i] ? "reel-spinning" : ""}
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
