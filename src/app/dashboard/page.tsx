"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { SlotMachine } from "@/components/SlotMachine";
import { Modal } from "@/components/Modal";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, getUser, getAccessToken, setUser } from "@/lib/constants";

function Dashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUserState] = useState<any>(null);
  const [depositModal, setDepositModal] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/auth/signin");
      return;
    }
    setUserState(u);
  }, [router]);

  const handleSpin = async () => {
    if (!user || user.coins <= 0) {
      setDepositModal(true);
      return null;
    }
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${baseUrl}/system/spin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { isWin, reels, amount, coinsLeft } = response.data;
      
      const updatedUser = { ...user, coins: coinsLeft };
      setUserState(updatedUser);
      setUser(updatedUser);

      if (isWin) {
        showToast(`You won ₦${amount.toLocaleString()}!`, "success");
      }

      return { isWin, reels, amount };
    } catch (err: any) {
      console.error("Failed to spin:", err);
      showToast(err.response?.data?.message || "Failed to process spin. Try again.", "error");
      return null;
    }
  };

  return (
    <div className="app-screen pb-[112px] md:pb-4">
      {/* Top Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/images/favicon.png" alt="Super Awoof" width={32} height={32} style={{ borderRadius: 10, height: "auto" }} className="md:hidden" />
          <div>
            <p className="font-display" style={{ fontSize: 16, color: "white", lineHeight: 1 }}>
              Good game 🎰
            </p>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {user?.fullname ?? "Player"}
            </p>
          </div>
        </div>

        {/* Coin Balance */}
        <button
          onClick={() => setDepositModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--gold-dim)",
            border: "1px solid rgba(245,166,35,0.2)",
            borderRadius: 12,
            padding: "8px 14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Image src="/images/AwoofCoin.png" alt="Coins" width={20} height={20} />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 9, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>
              Balance
            </p>
            <p style={{ fontSize: 16, color: "white", fontWeight: 800, lineHeight: 1.2 }}>
              {user?.coins ?? 0}
            </p>
          </div>
        </button>
      </header>

      {/* Slot Machine Stage */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 20px", overflow: "hidden" }}>
        <SlotMachine
          coins={user?.coins ?? 0}
          onNoCoins={() => setDepositModal(true)}
          onSpin={handleSpin}
        />
      </div>

      {/* Stats Row */}
      <div
        className="hidden md:grid"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        {[
          { label: "Jackpot",    value: "₦50k", accent: "var(--green)" },
          { label: "Players",   value: "1.2k",    accent: "var(--gold)" },
          { label: "Top Win",  value: "₦5k",   accent: "var(--green)" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 12px" }}>
            <p style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {s.label}
            </p>
            <p className="font-display" style={{ fontSize: 16, color: "white" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Deposit Modal */}
      <Modal
        visible={depositModal}
        onClose={() => setDepositModal(false)}
        title="Your Balance"
        confirmText="Deposit Coins"
        cancelText="Wallet"
        onConfirm={() => { setDepositModal(false); router.push("/dashboard/deposit"); }}
        onCancel={() => { setDepositModal(false); router.push("/dashboard/wallet"); }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0 32px 0" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
              Available Coins
            </p>
            <p className="font-display" style={{ fontSize: 64, color: "white", lineHeight: 1 }}>
              {user?.coins ?? 0}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
