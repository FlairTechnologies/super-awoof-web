"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl } from "@/lib/constants";

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
    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}/account/register`, {
        fullname: fullName,
        phone,
        password,
      });
      showToast(response.data.msg || "Account created!", "success");
      setTimeout(() => router.push("/auth/otp"), 1200);
    } catch (error: any) {
      showToast(error.response?.data?.error || "Registration failed. Try again.", "error");
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
        <div className="card" style={{ padding: "56px 48px", display: "flex", flexDirection: "column", gap: 36 }}>
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-4">
            <Image src="/images/favicon.png" alt="Super Awoof" width={44} height={44} style={{ borderRadius: 12 }} />
            <div>
              <p className="font-display" style={{ fontSize: 20, color: "white" }}>Super Awoof</p>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>Register with phone</p>
            </div>
          </div>

          <div>
            <h2 className="font-display" style={{ fontSize: 32, color: "white", marginBottom: 8 }}>Create Account</h2>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Register using your phone number</p>
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
              placeholder="+234 800 000 0000"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Password"
              placeholder="Min. 8 characters"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Button text="Create Account" onClick={handleRegister} isLoading={loading} />
            <button
              onClick={() => router.push("/auth/signup")}
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

export default function SignUpPhonePage() {
  return (
    <ToastProvider>
      <SignUpPhoneForm />
    </ToastProvider>
  );
}
