"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Input, PasswordInput } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, setTokens, setUser } from "@/lib/constants";

function SignInPhoneForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}/account/login`, { phone, password });
      const accountData = {
        ...response.data.account,
        coins: response.data.account.coins,
        paymentMethod: response.data.paymentMethod,
        mno: response.data.mno,
      };
      setUser(accountData);
      setTokens(response.data.accessToken, response.data.refreshToken);
      showToast("Welcome back!", "success");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error: any) {
      const msg = error.response?.data?.message || "An error occurred. Try again.";
      if (msg === "Please verify your account in order to login") {
        showToast(msg, "error");
        setTimeout(() => router.push("/auth/otp"), 800);
      } else {
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2" style={{ maxWidth: 1100 }}>
        {/* Left – Branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 48px",
            gap: 32,
          }}
          className="hidden md:flex"
        >
          <Image
            src="/images/favicon.png"
            alt="Super Awoof"
            width={72}
            height={72}
            style={{ borderRadius: 20 }}
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
            {["Instant payouts", "Provably fair", "Secure platform"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} className="pulse-dot" />
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right – Form */}
        <div className="card" style={{ padding: "56px 48px", display: "flex", flexDirection: "column", gap: 40 }}>
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-4">
            <Image src="/images/favicon.png" alt="Super Awoof" width={44} height={44} style={{ borderRadius: 12 }} />
            <div>
              <p className="font-display" style={{ fontSize: 20, color: "white" }}>Super Awoof</p>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>Sign in with phone</p>
            </div>
          </div>

          <div>
            <h2 className="font-display" style={{ fontSize: 32, color: "white", marginBottom: 8 }}>Sign In</h2>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Enter your phone number to continue</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Input
              label="Phone Number"
              placeholder="+234 800 000 0000"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Button text="Sign In" onClick={handleLogin} isLoading={loading} />
            <button
              onClick={() => router.push("/auth/signin")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted)", textAlign: "center" }}
            >
              Use email instead
            </button>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            New to Super Awoof?{" "}
            <button
              onClick={() => router.push("/auth/signup")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green)", fontWeight: 700 }}
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPhonePage() {
  return (
    <ToastProvider>
      <SignInPhoneForm />
    </ToastProvider>
  );
}
