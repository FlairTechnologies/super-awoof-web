"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Input, PasswordInput } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl } from "@/lib/constants";
import { attributionPayload } from "@/lib/attribution";

function SignUpEmailForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (fullName.trim().length < 3) {
      showToast("Please enter a valid full name.", "error");
      return;
    }
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    if (password.length < 8) {
      showToast("Password must be at least 8 characters long.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}/account/register`, {
        fullname: fullName.trim(),
        email: email.trim(),
        password,
        ...attributionPayload(),
      });
      showToast(response.data.msg || "Account created!", "success");
      localStorage.setItem("pendingEmail", email);
      localStorage.removeItem("pendingPhone");
      localStorage.setItem("verifyEndpoint", "/account/verify");
      localStorage.setItem("isNewAccount", "true");
      // They have an account but no subscription, so the plans page is the
      // only screen that can move them forward.
      try {
        sessionStorage.setItem("returnTo", "/subscribe");
      } catch {
        // Non-fatal: they land on the dashboard and can reach plans from there.
      }
      setTimeout(() => router.push("/auth/otp"), 1200);
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed. Try again.",
        "error",
      );
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
              Start<br />winning today.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 340 }}>
              Create your Super Awoof account and join thousands of players already winning big.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 16 }}>
            {["Free to join", "Cash out to your bank", "Play anytime, anywhere"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }}
                  className="pulse-dot"
                />
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right – Form */}
        <div
          className="card auth-form-card"
          style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24, width: "100%", maxHeight: "90dvh", overflowY: "auto" }}
        >
          {/* Mobile Welcome Message */}
          <div className="mobile-only text-center mb-2 flex-col">
            <h1 className="font-display" style={{ fontSize: 32, color: "white", marginBottom: 8 }}>
              Join us today
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Create your account to start winning</p>
          </div>

          <div className="desktop-only flex-col">
            <h2 className="font-display" style={{ fontSize: 24, color: "white", marginBottom: 4 }}>
              Create Account
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Fill in your details to get started</p>
          </div>

          {/* Playing is billed through an MTN subscription, which is keyed to a
              phone number. An email-only account can never be credited coins,
              so say so here rather than letting someone find out afterwards. */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "14px 16px",
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.6,
            }}
          >
            Coins are credited through an MTN subscription, so you will still
            need to subscribe with an MTN number before you can play.{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/signup")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "var(--green)",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Sign up with your number instead
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Input
              label="Full Name"
              placeholder="Your full name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email Address"
              placeholder="you@example.com"
              inputMode="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              label="Create Password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordInput
              label="Confirm Password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Button text="Create Account" onClick={handleRegister} isLoading={loading} />
            <button
              onClick={() => router.push("/auth/signup")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color: "var(--muted)", textAlign: "center",
              }}
            >
              Register with phone number instead
            </button>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 24,
              textAlign: "center",
              fontSize: 14,
              color: "var(--muted)",
            }}
          >
            Already have an account?{" "}
            <button
              onClick={() => router.push("/auth/signin")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--green)", fontWeight: 700,
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpEmailPage() {
  return (
    <ToastProvider>
      <SignUpEmailForm />
    </ToastProvider>
  );
}
