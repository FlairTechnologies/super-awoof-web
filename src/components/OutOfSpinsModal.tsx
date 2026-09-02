"use client";
import { X } from "lucide-react";
import { Button } from "./Button";

const CoinStackIcon = ({ size = 42 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="34" rx="16" ry="6" fill="url(#outOfSpinsCoinGrad)" stroke="#1DB954" strokeWidth="1.5" />
    <path d="M8 34V38C8 41.3 15.2 44 24 44C32.8 44 40 41.3 40 38V34" stroke="#1DB954" strokeWidth="1.5" strokeLinecap="round" />
    <ellipse cx="24" cy="26" rx="16" ry="6" fill="url(#outOfSpinsCoinGrad)" stroke="#1DB954" strokeWidth="1.5" />
    <path d="M8 26V30C8 33.3 15.2 36 24 36C32.8 36 40 33.3 40 30V26" stroke="#1DB954" strokeWidth="1.5" strokeLinecap="round" />
    <ellipse cx="24" cy="18" rx="16" ry="6" fill="url(#outOfSpinsCoinGrad)" stroke="#1DB954" strokeWidth="1.5" />
    <path d="M8 18V22C8 25.3 15.2 28 24 28C32.8 28 40 25.3 40 22V18" stroke="#1DB954" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="24" cy="18" r="8" stroke="rgba(29, 185, 84, 0.6)" strokeWidth="1" />
    <defs>
      <linearGradient id="outOfSpinsCoinGrad" x1="8" y1="12" x2="40" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1DB954" />
        <stop offset="1" stopColor="#0F1219" />
      </linearGradient>
    </defs>
  </svg>
);

interface OutOfSpinsModalProps {
  visible: boolean;
  onClose: () => void;
  /** Secondary action, e.g. take the player to their wallet. */
  onSecondary?: () => void;
  secondaryText?: string;
}

/**
 * Shown in place of a redirect when a player runs out of coins and cannot buy
 * more (VAS subscribers while the licence is outstanding). Coins are only
 * credited when the subscription renews - there is no daily top-up - so this
 * points at the renewal shortcode instead of dumping the player on the wallet.
 */
export const OutOfSpinsModal = ({
  visible,
  onClose,
  onSecondary,
  secondaryText = "View Wallet",
}: OutOfSpinsModalProps) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ alignItems: "center", textAlign: "center", padding: "36px 28px 28px 28px", gap: 24 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A8A8A8] hover:text-white transition-colors"
        >
          <X size={22} />
        </button>

        {/* Glowing coin icon with layered rings */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 120, width: 120 }}>
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(29, 185, 84, 0.06)",
              border: "1px solid rgba(29, 185, 84, 0.1)",
              animation: "pulse-dot 3s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "rgba(29, 185, 84, 0.08)",
              border: "1px solid rgba(29, 185, 84, 0.15)",
            }}
          />
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(29, 185, 84, 0.2) 0%, rgba(29, 185, 84, 0.08) 100%)",
              border: "1.5px solid rgba(29, 185, 84, 0.35)",
              boxShadow: "0 0 24px rgba(29, 185, 84, 0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            <CoinStackIcon size={42} />
          </div>
        </div>

        {/* Title & Body */}
        <div className="flex flex-col items-center gap-4">
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(29, 185, 84, 0.8)",
                marginBottom: 10,
              }}
            >
              Out of Spins
            </p>
            <h2
              className="font-display"
              style={{ color: "white", fontSize: 26, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" }}
            >
              No Spins Left
            </h2>
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.7, maxWidth: 320 }}>
            You&apos;ve used up all your spins. Renew your subscription to get a fresh set of coins.
          </p>
        </div>

        {/* SMS shortcode info pill */}
        <div
          style={{
            width: "100%",
            padding: "16px 20px",
            borderRadius: 16,
            background: "rgba(29, 185, 84, 0.05)",
            border: "1px solid rgba(29, 185, 84, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(29, 185, 84, 0.12)",
              border: "1px solid rgba(29, 185, 84, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 16,
            }}
          >
            📲
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
            Send{" "}
            <span style={{ color: "#1DB954", fontWeight: 700, background: "rgba(29, 185, 84, 0.1)", padding: "1px 6px", borderRadius: 6 }}>
              SA1
            </span>{" "}
            to{" "}
            <span style={{ color: "#1DB954", fontWeight: 700, background: "rgba(29, 185, 84, 0.1)", padding: "1px 6px", borderRadius: 6 }}>
              20138
            </span>{" "}
            to renew and keep spinning.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <Button
            text="Got it"
            onClick={onClose}
            style={{ height: 56, borderRadius: 16, fontSize: 16, fontWeight: 800 }}
          />
          {onSecondary && (
            <button
              onClick={onSecondary}
              className="w-full text-center bg-[#151922] hover:bg-[#1C212E] text-white border border-white/10 transition-all font-bold tracking-wide"
              style={{ height: 52, borderRadius: 14, fontSize: 15 }}
            >
              {secondaryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
