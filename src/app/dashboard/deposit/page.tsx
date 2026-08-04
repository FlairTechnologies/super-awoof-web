"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, getAccessToken, getUser } from "@/lib/constants";
import {
  ArrowDownUp,
  X,
  ChevronLeft,
  Flame,
  Gamepad2,
  Wallet,
  Copy,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} copied to clipboard!`, "success");
    setTimeout(() => setCopiedKey(null), 2500);
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
    if (!token) {
      router.push("/auth/signin");
      return;
    }
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
      <div className="page-container min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const isSubscriber = user?.loginMode === "phone" || user?.phone;

  return (
    <div
      className="page-container min-h-screen bg-[#0A0C10] animate-fade-in relative overflow-hidden"
      style={{ padding: "40px 20px 120px 20px" }}
    >
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#1DB954]/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#F5A623]/5 blur-[160px] pointer-events-none rounded-full" />

      <div style={{ maxWidth: isSubscriber ? 560 : 880, margin: "0 auto", width: "100%" }} className="relative z-10">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-white font-black text-2xl font-display tracking-tight">
                {isSubscriber ? "Daily Spin Limit" : "Deposit Coins"}
              </h1>
              <p className="text-white/40 text-xs font-semibold">
                {isSubscriber ? "MTN Subscription Account" : "Fund your gaming wallet"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wide uppercase text-white/80">
              {isSubscriber ? "Subscriber" : "Wallet Mode"}
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
           SUBSCRIBER VIEW — Spin Limit Reached Card
        ═══════════════════════════════════════════════════ */}
        {isSubscriber ? (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            {/* Glowing Icon Header */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1DB954]/20 via-[#1DB954]/10 to-transparent border border-[#1DB954]/30 flex items-center justify-center shadow-[0_0_50px_rgba(29,185,84,0.25)] backdrop-blur-md">
                <Flame className="w-12 h-12 text-[#1DB954] animate-bounce" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#F5A623] text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md">
                Limit
              </div>
            </div>

            {/* Main Glassmorphism Notice Card */}
            <div className="w-full rounded-3xl p-7 md:p-9 border border-[#1DB954]/20 bg-gradient-to-b from-[#151922]/90 via-[#0F1219]/90 to-[#0A0C10]/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
              {/* Subtle accent bar on top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1DB954] to-transparent" />

              <h2 className="text-white text-2xl font-black font-display tracking-tight mb-3">
                Spin Limit Reached
              </h2>
              <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-7">
                You have exhausted your allocated spins for today. Come back tomorrow for fresh spins, or renew your MTN subscription via SMS below.
              </p>

              {/* SMS Subscription Action Card */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 text-left mb-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#1DB954]" />
                    <span className="text-white/90 text-xs font-bold uppercase tracking-wider">
                      Instant SMS Renewal
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1DB954]/15 text-[#1DB954]">
                    MTN 20138
                  </span>
                </div>

                <p className="text-white/60 text-xs mb-4">
                  Send <strong className="text-[#1DB954] font-bold">SA1</strong> to shortcode <strong className="text-white font-bold">20138</strong> to reactivate your daily spin bundle immediately.
                </p>

                {/* Quick Copy Chips */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Keyword Copy */}
                  <button
                    onClick={() => handleCopy("SA1", "Keyword (SA1)", "kw")}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#1DB954]/40 hover:bg-[#1DB954]/10 transition-all text-left cursor-pointer group"
                  >
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-white/40">Keyword</span>
                      <span className="text-sm font-extrabold text-white font-mono">SA1</span>
                    </div>
                    {copiedKey === "kw" ? (
                      <Check className="w-4 h-4 text-[#1DB954]" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                    )}
                  </button>

                  {/* Shortcode Copy */}
                  <button
                    onClick={() => handleCopy("20138", "Shortcode (20138)", "sc")}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#1DB954]/40 hover:bg-[#1DB954]/10 transition-all text-left cursor-pointer group"
                  >
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-white/40">Shortcode</span>
                      <span className="text-sm font-extrabold text-[#1DB954] font-mono">20138</span>
                    </div>
                    {copiedKey === "sc" ? (
                      <Check className="w-4 h-4 text-[#1DB954]" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full">
              <button
                onClick={() => router.push("/dashboard")}
                className="btn btn-primary flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-black tracking-wider uppercase cursor-pointer"
              >
                <Gamepad2 className="w-5 h-5" />
                Return to Game
              </button>

              <button
                onClick={() => router.push("/dashboard/wallet")}
                className="h-14 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white/90 transition-all text-sm font-bold flex items-center justify-center gap-2 flex-1 cursor-pointer"
              >
                <Wallet className="w-5 h-5 text-white/60" />
                Return to Wallet
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════
               EMAIL-USER LAYOUT — Paystack Coin Packages
            ═══════════════════════════════════════════════════ */}
            <div style={{ marginBottom: 40 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white/60 text-xs font-bold tracking-wider uppercase px-1 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" />
                  Select Coin Package
                </h2>
                <span className="text-xs text-[#1DB954] font-semibold">1 Coin = ₦25</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PACKAGES.map((pkg) => {
                  const isSelected = Number(coin) === pkg.coins;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => selectPackage(pkg.coins)}
                      className={`relative flex flex-col items-center justify-between rounded-3xl p-6 border transition-all duration-300 select-none cursor-pointer ${
                        isSelected
                          ? "bg-[#1DB954]/15 border-[#1DB954] shadow-[0_0_35px_rgba(29,185,84,0.3)] scale-[1.02]"
                          : "bg-[#151922]/80 border-white/10 hover:border-white/20 hover:bg-[#1C212E] hover:scale-[1.01]"
                      }`}
                      style={{ minHeight: 210 }}
                    >
                      {pkg.badge && (
                        <div
                          className={`absolute top-3 right-3 rounded-full text-[9px] font-black tracking-wider uppercase shadow-md flex items-center justify-center ${
                            pkg.badge === "Popular"
                              ? "bg-amber-500 text-black shadow-amber-500/20"
                              : "bg-cyan-500 text-black shadow-cyan-500/20"
                          }`}
                          style={{ padding: "3px 10px" }}
                        >
                          {pkg.badge}
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-4 w-full pt-2">
                        <CoinStackIcon size={52} active={isSelected} />
                        <div className="text-center">
                          <div className={`text-3xl font-black font-display ${isSelected ? "text-[#1DB954]" : "text-white"}`}>
                            {pkg.coins}
                          </div>
                          <div className="text-white/50 text-xs font-semibold mt-0.5">coins</div>
                        </div>
                      </div>
                      <div className="text-center mt-4 w-full pt-2 border-t border-white/5">
                        <div className="text-white/60 text-xs font-semibold">{pkg.name}</div>
                        <div className={`text-base font-black mt-0.5 ${isSelected ? "text-[#1DB954]" : "text-white"}`}>
                          ₦{pkg.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div style={{ marginBottom: 40 }}>
              <h2 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-5 px-1">Or Enter Custom Amount</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <Input
                  label="Coins"
                  placeholder="e.g. 50"
                  value={coin}
                  onChange={(e) => handleCoinChange(e.target.value)}
                  type="number"
                />
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1C2029] border border-white/10 text-white/40 shadow-md mx-auto md:my-0 my-2">
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
            <div style={{ marginTop: 40 }}>
              <Button
                text={`Fund Wallet with ₦${Number(amount || 0).toLocaleString()}`}
                onClick={handlePay}
                disabled={!isValid}
                isLoading={loading}
                style={{ height: 56, borderRadius: 16, fontSize: 16, fontWeight: 800 }}
              />
              <button
                onClick={() => router.push("/dashboard/wallet")}
                className="w-full text-center text-white/50 hover:text-white transition-colors mt-6 text-sm font-medium underline py-2 cursor-pointer"
              >
                Cancel and Return to Wallet
              </button>
            </div>
          </>
        )}
      </div>

      {/* Paystack iFrame Overlay */}
      {paymentUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col backdrop-blur-lg">
          <div className="flex justify-between items-center px-6 py-4 bg-[#12151D] border-b border-white/10">
            <span className="text-white font-bold text-base">Complete Payment</span>
            <button onClick={handlePaymentClose} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10">
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
