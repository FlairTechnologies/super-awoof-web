"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, getAccessToken, getUser } from "@/lib/constants";
import { canDeposit } from "@/lib/features";
import { WithdrawModal, WithdrawPayload } from "@/components/WithdrawModal";
import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";

function WalletContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [walletUser, setWalletUser] = useState<any>(null);
  const [balance, setBalance] = useState("0");
  const [banks, setBanks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWalletUser(getUser());
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    axios.get(`${baseUrl}/wallet`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setBalance(r.data.balance))
      .catch(() => {});
    axios.get(`${baseUrl}/wallet/banks`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setBanks(r.data || []))
      .catch(() => {});
    axios.get(`${baseUrl}/wallet/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setHistory(r.data || []))
      .catch(() => {});
  }, []);

  const refreshWallet = () => {
    const token = getAccessToken();
    axios.get(`${baseUrl}/wallet`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setBalance(r.data.balance))
      .catch(() => {});
    axios.get(`${baseUrl}/wallet/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setHistory(r.data || []))
      .catch(() => {});
  };

  const handleWithdraw = async (payload: WithdrawPayload): Promise<boolean> => {
    try {
      setLoading(true);
      const token = getAccessToken();
      const res = await axios.post(
        `${baseUrl}/wallet/withdraw`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res?.data?.message || "Withdrawal Successful!", "success");
      setShowModal(false);
      refreshWallet();
      return true;
    } catch (error: any) {
      showToast(error.response?.data?.message || "Withdrawal failed.", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container min-h-screen bg-[#0F1219] animate-fade-in" style={{ padding: "64px 28px 160px 28px" }}>
      <div style={{ maxWidth: 850, margin: "0 auto", width: "100%" }}>
        {/* Header - Back button removed */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
          <h1 className="text-white font-bold text-3xl font-display tracking-wide">Wallet</h1>
        </div>

        {/* Rebuilt Gaming Wallet Card */}
        <div
          className="relative w-full rounded-3xl overflow-hidden card"
          style={{
            background: "radial-gradient(circle at 0% 0%, rgba(29, 185, 84, 0.12) 0%, transparent 60%), linear-gradient(135deg, #151922 0%, #0F1218 100%)",
            border: "1px solid rgba(29, 185, 84, 0.3)",
            boxShadow: "0 24px 50px rgba(0, 0, 0, 0.45), 0 0 40px rgba(29, 185, 84, 0.12), inset 0 0 30px rgba(255,255,255,0.02)",
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 32,
            marginBottom: 64,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Available Balance
              </p>
              <h2 className="font-sans font-bold tracking-tight" style={{ fontSize: 48, color: "white", marginTop: 16, textShadow: "0 0 20px rgba(255,255,255,0.15)" }}>
                ₦{parseFloat(balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            {/* Holographic bank card chip */}
            <div style={{
              width: 56,
              height: 42,
              borderRadius: 10,
              background: "linear-gradient(135deg, #F5A623 0%, #D48806 100%)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 5,
              padding: 8,
              opacity: 0.9,
              boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
            }}>
              <div style={{ display: "flex", gap: 5, height: "100%" }}>
                <div style={{ flex: 1, borderRight: "1px solid rgba(0,0,0,0.15)", borderBottom: "1px solid rgba(0,0,0,0.15)" }}></div>
                <div style={{ flex: 1, borderBottom: "1px solid rgba(0,0,0,0.15)" }}></div>
                <div style={{ flex: 1, borderLeft: "1px solid rgba(0,0,0,0.15)", borderBottom: "1px solid rgba(0,0,0,0.15)" }}></div>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 32, display: "grid", gridTemplateColumns: canDeposit(walletUser) ? "1fr 1fr" : "1fr", gap: 20 }}>
            {canDeposit(walletUser) && (
              <Button
                text="Deposit"
                onClick={() => router.push("/dashboard/deposit")}
                style={{
                  height: 52,
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              />
            )}
            <Button
              text="Withdraw Funds"
              onClick={() => setShowModal(true)}
              disabled={parseFloat(balance) <= 0}
              style={{
                height: 52,
                borderRadius: 16,
                fontSize: 15,
                fontWeight: 700,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white",
              }}
            />
          </div>
        </div>

        {/* Transaction History Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <h2 className="text-white font-bold text-2xl font-display tracking-wide" style={{ marginBottom: 12 }}>Transaction History</h2>
          {history.length === 0 ? (
            <div className="card" style={{ padding: "80px 24px", textAlign: "center", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, background: "rgba(21, 25, 34, 0.4)", borderRadius: 24 }}>
              <History size={56} style={{ opacity: 0.2, color: "white" }} />
              <p style={{ fontSize: 16, fontWeight: 500 }}>No transactions recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {history.map((tx: any) => (
                <div
                  key={tx.id}
                  className="card"
                  style={{
                    padding: "24px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(21, 25, 34, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.03)",
                    borderRadius: 24,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: tx.type === "credit" ? "var(--green-dim)" : "rgba(255, 77, 77, 0.1)",
                        border: tx.type === "credit" ? "1px solid rgba(29, 185, 84, 0.2)" : "1px solid rgba(255, 77, 77, 0.2)",
                        color: tx.type === "credit" ? "var(--green)" : "var(--danger)",
                      }}
                    >
                      {tx.type === "credit" ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
                        {tx.label || (tx.type === "credit" ? "Deposit" : "Withdrawal")}
                      </p>
                      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: tx.type === "credit" ? "var(--green)" : "var(--danger)",
                        textShadow: tx.type === "credit" ? "0 0 8px var(--green-glow)" : "none",
                      }}
                    >
                      {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", marginTop: 4, letterSpacing: "0.05em" }}>
                      {tx.method === "paystack" ? "Paystack" : tx.method === "mtn_billing" ? "MTN Billing" : "Bank"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <WithdrawModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        balance={parseFloat(balance) || 0}
        banks={banks}
        loading={loading}
        onSubmit={handleWithdraw}
      />

    </div>
  );
}

export default function WalletPage() {
  return (
    <ToastProvider>
      <WalletContent />
    </ToastProvider>
  );
}
