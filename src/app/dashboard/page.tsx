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
      return;
    }
    const newBalance = user.coins - 1;
    const updatedUser = { ...user, coins: newBalance };
    setUserState(updatedUser);
    setUser(updatedUser);
    try {
      const token = getAccessToken();
      await axios.post(
        `${baseUrl}/account/update-coins/${newBalance}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to sync coins:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "0 0 24px" }}>
      {/* Top Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/images/favicon.png" alt="Super Awoof" width={36} height={36} style={{ borderRadius: 10 }} className="md:hidden" />
          <div>
            <p className="font-display" style={{ fontSize: 18, color: "white", lineHeight: 1 }}>
              Good game 🎰
            </p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
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
            gap: 10,
            background: "var(--gold-dim)",
            border: "1px solid rgba(245,166,35,0.2)",
            borderRadius: 14,
            padding: "10px 18px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Image src="/images/AwoofCoin.png" alt="Coins" width={24} height={24} />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>
              Balance
            </p>
            <p style={{ fontSize: 20, color: "white", fontWeight: 800, lineHeight: 1.2 }}>
              {user?.coins ?? 0}
            </p>
          </div>
          <span
            style={{
              background: "var(--gold)",
              color: "#1a0e00",
              fontSize: 16,
              fontWeight: 900,
              width: 26,
              height: 26,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
            }}
          >+</span>
        </button>
      </header>

      {/* Slot Machine Stage */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <SlotMachine
          coins={user?.coins ?? 0}
          onNoCoins={() => setDepositModal(true)}
          onSpin={handleSpin}
        />
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          padding: "0 24px",
        }}
      >
        {[
          { label: "Grand Prize",    value: "₦250,000", accent: "var(--green)" },
          { label: "Live Players",   value: "1,284",    accent: "var(--gold)" },
          { label: "Top Win Today",  value: "₦5,000",   accent: "var(--green)" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {s.label}
            </p>
            <p className="font-display" style={{ fontSize: 22, color: "white" }}>
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
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "24px 0" }}>
          <Image src="/images/AwoofCoin.png" alt="Coins" width={72} height={72} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              Available Coins
            </p>
            <p className="font-display" style={{ fontSize: 56, color: "white" }}>
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
