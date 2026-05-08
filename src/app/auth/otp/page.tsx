"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";

import { baseUrl, setTokens, setUser } from "@/lib/constants";

const VERIFY_URL = `${baseUrl}/account/verify`;
const RESEND_URL = `${baseUrl}/account/send-otp`;

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
    if (otp.length < 4) {
      showToast("Please enter the 4-digit code.", "error");
      return;
    }
    try {
      setLoading(true);
      
      // Step 2: Verify OTP
      // Use the endpoint stored from step 1, or fallback to verify-otp
      const storedEndpoint = localStorage.getItem("verifyEndpoint") || "/account/verify-otp";
      const isNewAccount = localStorage.getItem("isNewAccount") === "true";
      
      const response = await axios.post(`${baseUrl}${storedEndpoint}`, { otp: otp.join("") });

      if (response.status === 200) {
        const { accessToken, refreshToken, account } = response.data;
        
        if (accessToken) {
          // Store tokens and user data
          setTokens(accessToken, refreshToken);
          setUser(account);
          
          showToast(isNewAccount ? "Account created successfully!" : "Logged in successfully!", "success");
          setTimeout(() => router.push("/dashboard"), 1200);
        } else {
          // Fallback for unexpected response structure
          showToast("Verification successful!", "success");
          setTimeout(() => router.push("/auth/signin"), 1200);
        }
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Invalid or expired code. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const phone = localStorage.getItem("pendingPhone");
      if (!phone) {
        showToast("Phone number not found. Please sign in again.", "error");
        router.push("/auth/signin");
        return;
      }
      await axios.post(`${baseUrl}/account/signin/phone`, { phone });
      showToast("Code resent!", "success");
    } catch (error: any) {
      showToast("Failed to resend code. Try again.", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="app-screen" style={{ padding: "32px 24px", justifyContent: "center" }}>
      <div className="flex justify-center mb-8 mt-4">
        <Image src="/images/favicon.png" alt="Super Awoof" width={48} height={48} style={{ height: "auto" }} />
      </div>

      <div className="mb-8">
        <h1 className="text-white font-bold text-[27px]">Verification Code</h1>
        <p className="text-white/70 text-lg mt-2">Check your phone or email for your 4-digit OTP.</p>
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

      <Button text="Verify OTP" onClick={handleVerify} isLoading={loading} />
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
