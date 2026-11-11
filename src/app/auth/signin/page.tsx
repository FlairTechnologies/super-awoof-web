"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, setTokens, setUser } from "@/lib/constants";

function SignInPhoneForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
      showToast("Please enter a valid 10 or 11-digit phone number.", "error");
      return;
    }
    try {
      setLoading(true);
      // Step 1: Sign in with phone number
      const response = await axios.post(`${baseUrl}/account/signin/phone`, { phone: cleanPhone });
      
      const { isNewAccount, verifyEndpoint } = response.data;
      
      // Store these for the OTP verification step
      localStorage.setItem("pendingPhone", cleanPhone);
      localStorage.removeItem("pendingEmail");
      localStorage.setItem("isNewAccount", String(isNewAccount));
      localStorage.setItem("verifyEndpoint", verifyEndpoint);

      showToast("Verification code sent!", "success");
      setTimeout(() => router.push("/auth/otp"), 1000);
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 406) {
        showToast("Please enter a valid MTN number.", "error");
      } else if (status === 400 && data?.message?.includes("subscription")) {
        showToast("You are not subscribed yet. Taking you to the plans...", "error");
        setTimeout(() => router.push("/subscribe"), 1200);
      } else {
        showToast(data?.message || "An error occurred. Try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="w-full grid grid-cols-1 md:grid-cols-2" style={{ maxWidth: 1100 }}>
        {/* Left – Branding */}
        <div
          className="desktop-only"
          style={{
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 48px",
            gap: 32,
          }}
        >
          <Image
            src="/images/favicon.png"
            alt="Super Awoof"
            width={72}
            height={72}
            style={{ borderRadius: 20, height: "auto" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 className="font-display" style={{ fontSize: 48, lineHeight: 1.1, color: "white" }}>
              Welcome<br />back.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 340 }}>
              Log in with your phone number to continue your winning streak.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 16 }}>
            {["Cash out to your bank", "Coins every cycle", "Stop anytime"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} className="pulse-dot" />
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right – Form */}
        <div 
          className="card auth-form-card" 
          style={{ 
            padding: "32px 24px", 
            display: "flex", 
            flexDirection: "column", 
            gap: 24,
            width: "100%",
            maxHeight: "90dvh",
            overflowY: "auto"
          }}
        >
          {/* Mobile Welcome Message */}
          <div className="mobile-only text-center mb-2 flex-col">
            <h1 className="font-display" style={{ fontSize: 32, color: "white", marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Enter your phone number to sign in</p>
          </div>

          <div className="desktop-only flex-col">
            <h2 className="font-display" style={{ fontSize: 24, color: "white", marginBottom: 4 }}>Sign In</h2>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Enter your phone number to continue</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Input
              label="Phone Number"
              placeholder="0800 000 0000"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onEnter={handleLogin}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Button text="Sign In" onClick={handleLogin} isLoading={loading} />
            <button
              onClick={() => router.push("/auth/signin/email")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted)", textAlign: "center", minHeight: 44, width: "100%" }}
            >
              Use email instead
            </button>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            New to Super Awoof?{" "}
            <button
              onClick={() => router.push("/auth/signup")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green)", fontWeight: 700, minHeight: 44, padding: "0 8px" }}
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <ToastProvider>
      <SignInPhoneForm />
    </ToastProvider>
  );
}
