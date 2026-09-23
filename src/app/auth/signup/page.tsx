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

function SignUpPhoneForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !phone || !password) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (fullName.trim().length < 3) {
      showToast("Please enter a valid full name.", "error");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
      showToast("Please enter a valid 10 or 11-digit phone number.", "error");
      return;
    }
    if (password.length < 8) {
      showToast("Password must be at least 8 characters long.", "error");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}/account/register`, {
        fullname: fullName.trim(),
        phone: cleanPhone,
        password,
        ...attributionPayload(),
      });
      showToast(response.data.msg || "Account created!", "success");
      localStorage.setItem("pendingPhone", cleanPhone);
      localStorage.removeItem("pendingEmail");
      localStorage.setItem("verifyEndpoint", "/account/verify");
      localStorage.setItem("isNewAccount", "true");
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
              Register with your phone number to get started on Super Awoof.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 16 }}>
            {["Free to join", "Instant payouts", "Play anytime, anywhere"].map((f) => (
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
            gap: 20,
            width: "100%",
            maxHeight: "90dvh",
            overflowY: "auto"
          }}
        >
          {/* Mobile Welcome Message */}
          <div className="mobile-only text-center mb-2 flex-col">
            <h1 className="font-display" style={{ fontSize: 32, color: "white", marginBottom: 8 }}>
              Join us today
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Create your account to start winning</p>
          </div>

          <div className="desktop-only flex-col">
            <h2 className="font-display" style={{ fontSize: 24, color: "white", marginBottom: 4 }}>Create Account</h2>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Register using your phone number</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Input
              label="Full Name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="0800 000 0000"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <PasswordInput
              label="Password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Button text="Create Account" onClick={handleRegister} isLoading={loading} />
            <button
              onClick={() => router.push("/auth/signup/email")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted)", textAlign: "center" }}
            >
              Use email instead
            </button>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            Already have an account?{" "}
            <button
              onClick={() => router.push("/auth/signin")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green)", fontWeight: 700 }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <ToastProvider>
      <SignUpPhoneForm />
    </ToastProvider>
  );
}
