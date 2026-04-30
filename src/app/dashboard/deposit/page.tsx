"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { TabBar } from "@/components/TabBar";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, getAccessToken } from "@/lib/constants";
import { ArrowDownUp, X } from "lucide-react";

function DepositForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [coin, setCoin] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [reference, setReference] = useState("");

  const handleCoinChange = (val: string) => {
    setCoin(val);
    setAmount(val ? (Number(val) * 25).toString() : "");
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    setCoin(val ? (Number(val) / 25).toString() : "");
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
    } catch (error: any) {
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
    } catch {
      showToast("Payment was abandoned or not completed.", "error");
    }
  };

  return (
    <div className="page-container min-h-screen bg-[#0F1219] px-5 py-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-2xl">Deposit</h1>
      </div>

      <div className="flex flex-col gap-5">
        <Input
          label="Coins"
          placeholder="1"
          value={coin}
          onChange={(e) => handleCoinChange(e.target.value)}
          error={!!coin && Number(coin) < 1}
        />

        <div className="flex justify-center">
          <div className="flex gap-2 text-white/60">
            <ArrowDownUp size={22} />
          </div>
        </div>

        <Input
          label="Amount (Naira)"
          placeholder="25"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          error={!!amount && Number(amount) < 25}
        />

        {amount && Number(amount) < 25 && (
          <p className="text-red-500 text-sm -mt-2">Minimum amount is ₦25</p>
        )}
      </div>

      <div className="mt-10">
        <Button
          text="Continue"
          onClick={handlePay}
          disabled={!isValid}
          loading={loading}
        />
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full text-center text-[#00A859] mt-3 text-base underline py-2"
        >
          Cancel
        </button>
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
          <iframe
            src={paymentUrl}
            className="flex-1 w-full"
            title="Paystack Payment"
          />
        </div>
      )}

      <TabBar />
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
