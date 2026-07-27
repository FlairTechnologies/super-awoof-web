"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, getAccessToken, getUser } from "@/lib/constants";
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

  const isSubscriber = user?.loginMode === "phone" || user?.phone;

  return (
    <div
      className="page-container min-h-screen bg-[#0F1219] animate-fade-in"
      style={{ padding: "48px 24px 120px 24px" }}
    >
      <div style={{ maxWidth: isSubscriber ? 680 : 860, margin: "0 auto", width: "100%" }}>

        {/* Back + Page title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 transition-all cursor-pointer flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-white font-bold text-2xl font-display">Deposit Coins</h1>
        </div>

        {isSubscriber ? (
          <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in" style={{ gap: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(29, 185, 84, 0.1)", color: "#1DB954",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 8,
            }}>
              <CoinStackIcon size={40} active={true} />
            </div>
            <div>
              <h2 style={{ color: "white", fontSize: 24, fontWeight: 700 }}>
                Deposit Coins
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 16, marginTop: 6 }}>
                This page is coming soon
              </p>
            </div>
            <Button
              text="Return to Wallet"
              onClick={() => router.push("/dashboard/wallet")}
              style={{ marginTop: 8, padding: "0 32px", height: 48, borderRadius: 12 }}
            />

            {/* How to Resubscribe Instructions */}
            <div
              className="w-full rounded-2xl p-6 border text-left mt-6"
              style={{
                background: "rgba(21, 25, 34, 0.6)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                maxWidth: 480,
              }}
            >
              <h3 className="text-white font-bold text-base font-display mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
                How to Resubscribe
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                If your subscription has expired or you need to renew your account via MTN billing:
              </p>
              <div className="space-y-2.5 text-xs text-white/80">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1DB954]/20 text-[#1DB954] font-bold text-xs flex-shrink-0">1</span>
                  <span>Open your SMS / Messages app on your phone</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1DB954]/20 text-[#1DB954] font-bold text-xs flex-shrink-0">2</span>
                  <span>Send <strong className="text-[#1DB954] font-bold">SA1</strong> to <strong className="text-[#1DB954] font-bold">20138</strong> from your registered MTN number</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1DB954]/20 text-[#1DB954] font-bold text-xs flex-shrink-0">3</span>
                  <span>Once confirmed via SMS, your subscription will be renewed automatically</span>
                </div>
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
