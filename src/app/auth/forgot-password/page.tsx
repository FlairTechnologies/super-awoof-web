"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";

const RESET_URL = "https://super-awoof-d6b48f0a17a5.herokuapp.com/api/v1/account/request-password-reset";

function ForgotPasswordForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(RESET_URL, { email });
      if (response.status === 200) {
        localStorage.setItem("passwordEmailReset", email);
        showToast("A password reset link has been sent to your email.", "success");
        setTimeout(() => router.push("/auth/forgot-password/otp"), 1200);
      }
    } catch {
      showToast("Failed to send reset link. Please check your email.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container min-h-screen bg-[#0F1219] px-5 py-8 animate-fade-in">
      <div className="flex justify-center mb-8 mt-4">
        <Image src="/images/favicon.png" alt="Super Awoof" width={48} height={48} />
      </div>

      <div className="mb-8">
        <h1 className="text-white font-bold text-[27px]">Reset Your Password</h1>
        <p className="text-white/70 text-base mt-2 leading-relaxed">
          Enter your email address and we&apos;ll send you a password reset link.
        </p>
      </div>

      <Input
        label="Email Address"
        placeholder="email / phone number"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />

      <div className="mt-10">
        <Button text="Reset" onClick={handleReset} loading={loading} />
      </div>

      <div className="text-center mt-4">
        <button onClick={() => router.back()} className="text-[#00A859] text-sm hover:underline">
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <ToastProvider>
      <ForgotPasswordForm />
    </ToastProvider>
  );
}
