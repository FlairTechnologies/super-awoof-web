"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";

const VERIFY_URL = "https://super-awoof-d6b48f0a17a5.herokuapp.com/api/v1/account/verify";
const RESEND_URL = "https://super-awoof-d6b48f0a17a5.herokuapp.com/api/v1/account/send-otp";

function OTPForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
      showToast("Please enter the complete 4-digit OTP.", "error");
      return;
    }
    try {
      setLoading(true);
      await axios.post(VERIFY_URL, { otp: code });
      showToast("OTP verified successfully!", "success");
      setTimeout(() => router.push("/auth/signin"), 1200);
    } catch (error: any) {
      showToast(error.response?.data?.message || "OTP verification failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await axios.post(RESEND_URL);
      showToast("OTP has been resent!", "success");
    } catch {
      showToast("Failed to resend OTP.", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page-container min-h-screen bg-[#0F1219] px-5 py-8 animate-fade-in">
      <div className="flex justify-center mb-8 mt-4">
        <Image src="/images/favicon.png" alt="Super Awoof" width={48} height={48} />
      </div>

      <div className="mb-8">
        <h1 className="text-white font-bold text-[27px]">Email Verification Code</h1>
        <p className="text-white/70 text-lg mt-2">Check your email for your 4-digit OTP.</p>
      </div>

      {/* OTP boxes */}
      <div className="flex justify-around gap-3 mt-4 mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="w-16 h-16 bg-[#20232A] text-white text-center text-2xl font-bold rounded-xl border-2 border-[#34363B] focus:border-[#00A859] focus:outline-none transition-colors"
          />
        ))}
      </div>

      <div className="text-center mb-8">
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-[#FFFF45] text-sm hover:underline disabled:opacity-60"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </div>

      <Button text="Verify OTP" onClick={handleVerify} loading={loading} />
    </div>
  );
}

export default function OTPPage() {
  return (
    <ToastProvider>
      <OTPForm />
    </ToastProvider>
  );
}
