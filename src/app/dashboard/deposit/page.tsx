"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, getAccessToken, getUser } from "@/lib/constants";
import { canDeposit } from "@/lib/features";
import { ArrowDownUp, X, ChevronLeft } from "lucide-react";

const PACKAGES = [
  { id: "starter", name: "Starter Pack", coins: 10, price: 250, badge: null },
  { id: "classic", name: "Classic Pack", coins: 40, price: 1000, badge: "Popular" },
  { id: "booster", name: "Win Booster", coins: 100, price: 2500, badge: null },
  { id: "roller", name: "High Roller", coins: 200, price: 5000, badge: "Best Value" },
];

const CoinStackIcon = ({ size = 48, active = false }: { size?: number; active?: boolean }) => {
  const strokeColor = active ? "#1DB954" : "rgba(255, 255, 255, 0.35)";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transition: "all 0.3s ease" }}>
      <ellipse cx="24" cy="34" rx="16" ry="6" fill={`url(#coinStackGrad-${active})`} stroke={strokeColor} strokeWidth="1.5" />
      <path d="M8 34V38C8 41.3 15.2 44 24 44C32.8 44 40 41.3 40 38V34" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="24" cy="26" rx="16" ry="6" fill={`url(#coinStackGrad-${active})`} stroke={strokeColor} strokeWidth="1.5" />
      <path d="M8 26V30C8 33.3 15.2 36 24 36C32.8 36 40 33.3 40 30V26" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="24" cy="18" rx="16" ry="6" fill={`url(#coinStackGrad-${active})`} stroke={strokeColor} strokeWidth="1.5" />
      <path d="M8 18V22C8 25.3 15.2 28 24 28C32.8 28 40 25.3 40 22V18" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="18" r="8" stroke={active ? "rgba(29, 185, 84, 0.6)" : "rgba(255, 255, 255, 0.2)"} strokeWidth="1" />
      <defs>
        <linearGradient id={`coinStackGrad-${active}`} x1="8" y1="12" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#1DB954" : "#242936"} />
          <stop offset="1" stopColor="#0F1219" />
        </linearGradient>
      </defs>
    </svg>
  );
};

function DepositForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [coin, setCoin] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [user, setUser] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast(`${label} copied!`, "success");
    setTimeout(() => setCopiedText(null), 2500);
  };

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleCoinChange = (val: string) => {
    const sanitized = val.replace(/\D/g, "");
    setCoin(sanitized);
    setAmount(sanitized ? (Number(sanitized) * 25).toString() : "");
  };

  const handleAmountChange = (val: string) => {
    const sanitized = val.replace(/\D/g, "");
    setAmount(sanitized);
    setCoin(sanitized ? Math.floor(Number(sanitized) / 25).toString() : "");
  };

  const selectPackage = (coins: number) => {
    setCoin(coins.toString());
    setAmount((coins * 25).toString());
  };

  const isValid = Number(coin) >= 1 && Number(amount) >= 25;

  const handlePay = async () => {
    const token = getAccessToken();
    if (!token) { router.push("/auth/signin"); return; }
    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/wallet/fund`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentUrl(response.data.authorization_url);
      setReference(response.data.reference);
    } catch {
      showToast("Payment initiation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = async () => {
    setPaymentUrl(null);
    try {
      const token = getAccessToken();
      await axios.get(`${baseUrl}/wallet/verify/${reference}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Payment Successful!", "success");
      router.push("/dashboard/wallet");
    } catch {
      showToast("Payment was abandoned or not completed.", "error");
    }
  };

  if (!user) {
    return (
      <div className="page-container min-h-screen bg-[#0F1219] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // Deposit is gated while the VAS licence is outstanding; bounce subscribers
  // so the page cannot be reached by typing the URL.
  if (!canDeposit(user)) {
    router.replace("/dashboard/wallet");
    return (
      <div className="page-container min-h-screen bg-[#0F1219] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const isSubscriber = user?.loginMode === "phone" || user?.phone;

  return (
    <div
      className="min-h-[calc(100dvh-80px)] md:min-h-screen bg-[#0F1219] animate-fade-in flex flex-col justify-between"
      style={{ padding: isSubscriber ? "20px 20px 96px 20px" : "32px 24px 120px 24px" }}
    >
      <div style={{ maxWidth: isSubscriber ? 520 : 860, margin: "0 auto", width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Back + Page title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: isSubscriber ? 12 : 32 }}>
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 transition-all cursor-pointer flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-white font-bold text-2xl font-display">Deposit Coins</h1>
        </div>

        {isSubscriber ? (
          <div
            className="flex-1 flex flex-col items-center justify-center animate-fade-in w-full relative overflow-hidden"
            style={{ minHeight: "calc(100dvh - 180px)" }}
          >
            {/* Background ambient orbs */}
            <div
              style={{
                position: "absolute",
                top: "10%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 320,
                height: 320,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(29, 185, 84, 0.08) 0%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(40px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "5%",
                right: "-10%",
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(29, 185, 84, 0.05) 0%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(30px)",
              }}
            />

            <div
              className="w-full flex flex-col items-center justify-center text-center gap-8"
              style={{ maxWidth: 420, position: "relative", zIndex: 1 }}
            >
              {/* Glowing coin icon with layered rings */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Outer glow ring */}
                <div
                  style={{
                    position: "absolute",
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "rgba(29, 185, 84, 0.06)",
                    border: "1px solid rgba(29, 185, 84, 0.1)",
                    animation: "pulse 3s ease-in-out infinite",
                  }}
                />
                {/* Middle ring */}
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
                {/* Inner icon container */}
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
                  <CoinStackIcon size={42} active={true} />
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
                    Daily Limit
                  </p>
                  <h2
                    className="font-display"
                    style={{
                      color: "white",
                      fontSize: 28,
                      fontWeight: 800,
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Spin Limit Reached
                  </h2>
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 15,
                    lineHeight: 1.7,
                    maxWidth: 340,
                  }}
                >
                  You&apos;ve used all your spins for today. Come back tomorrow for a fresh set of spins.
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
                  Subscription expired? Send{" "}
                  <span
                    style={{
                      color: "#1DB954",
                      fontWeight: 700,
                      background: "rgba(29, 185, 84, 0.1)",
                      padding: "1px 6px",
                      borderRadius: 6,
                    }}
                  >
                    SA1
                  </span>{" "}
                  to{" "}
                  <span
                    style={{
                      color: "#1DB954",
                      fontWeight: 700,
                      background: "rgba(29, 185, 84, 0.1)",
                      padding: "1px 6px",
                      borderRadius: 6,
                    }}
                  >
                    20138
                  </span>{" "}
                  to renew.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                <Button
                  text="Return to Game"
                  onClick={() => router.push("/dashboard")}
                  style={{
                    height: 56,
                    borderRadius: 16,
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "0.01em",
                  }}
                />
                <button
                  onClick={() => router.push("/dashboard/wallet")}
                  style={{
                    height: 52,
                    borderRadius: 14,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(255, 255, 255, 0.03)",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = "white";
                    (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)";
                    (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  Go to Wallet
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════
               EMAIL-USER LAYOUT — Paystack Card Packages
            ═══════════════════════════════════════════════════ */}

            {/* Package Grid */}
            <div style={{ marginBottom: 48 }}>
              <h2 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-6 px-1">Select Coin Package</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PACKAGES.map((pkg) => {
                  const isSelected = Number(coin) === pkg.coins;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => selectPackage(pkg.coins)}
                      className={`relative flex flex-col items-center justify-between rounded-3xl p-6 border transition-all duration-300 select-none cursor-pointer ${
                        isSelected
                          ? "bg-[#1DB954]/10 border-[#1DB954] shadow-[0_0_30px_rgba(29,185,84,0.25)] scale-[1.03]"
                          : "bg-[#151922] border-white/10 hover:border-white/20 hover:bg-[#1C212E] hover:scale-[1.02]"
                      }`}
                      style={{ minHeight: 200 }}
                    >
                      {pkg.badge && (
                        <div
                          className={`absolute top-3 right-3 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md flex items-center justify-center ${
                            pkg.badge === "Popular"
                              ? "bg-amber-500 text-black shadow-amber-500/20"
                              : "bg-cyan-500 text-black shadow-cyan-500/20"
                          }`}
                          style={{ padding: "3px 10px" }}
                        >
                          {pkg.badge}
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-4 w-full">
                        <CoinStackIcon size={52} active={isSelected} />
                        <div className="text-center">
                          <div className={`text-3xl font-black font-display ${isSelected ? "text-[#1DB954]" : "text-white"}`}>
                            {pkg.coins}
                          </div>
                          <div className="text-white/50 text-xs font-semibold mt-0.5">coins</div>
                        </div>
                      </div>
                      <div className="text-center mt-4 w-full">
                        <div className="text-white/60 text-xs font-semibold">{pkg.name}</div>
                        <div className={`text-sm font-bold mt-1 ${isSelected ? "text-[#1DB954]" : "text-white"}`}>
                          ₦{pkg.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div style={{ marginBottom: 48 }}>
              <h2 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-6 px-1">Or Enter Custom Amount</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <Input
                  label="Coins"
                  placeholder="e.g. 50"
                  value={coin}
                  onChange={(e) => handleCoinChange(e.target.value)}
                  type="number"
                />
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1C2029] border border-white/10 text-white/40 shadow-md">
                  <ArrowDownUp size={16} />
                </div>
                <Input
                  label="Amount (Naira)"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  error={!!amount && Number(amount) < 25 ? "Minimum ₦25" : undefined}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 48 }}>
              <Button
                text={`Fund Wallet with ₦${Number(amount || 0).toLocaleString()}`}
                onClick={handlePay}
                disabled={!isValid}
                isLoading={loading}
                style={{ height: 56, borderRadius: 16, fontSize: 16, fontWeight: 800 }}
              />
              <button
                onClick={() => router.push("/dashboard/wallet")}
                className="w-full text-center text-[#A8A8A8] hover:text-white transition-colors mt-6 text-sm font-medium underline py-2 cursor-pointer"
                style={{ display: "block", marginTop: 24, marginBottom: 64 }}
              >
                Cancel and Return to Wallet
              </button>
            </div>
          </>
        )}
      </div>

      {/* Paystack iFrame Overlay */}
      {paymentUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <div className="flex justify-between items-center px-4 py-3 bg-[#12151D]">
            <span className="text-white font-semibold">Complete Payment</span>
            <button onClick={handlePaymentClose} className="text-white/70 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <iframe src={paymentUrl} className="flex-1 w-full" title="Paystack Payment" />
        </div>
      )}
    </div>
  );
}

export default function DepositPage() {
  return (
    <ToastProvider>
      <DepositForm />
    </ToastProvider>
  );
}
