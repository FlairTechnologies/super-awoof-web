"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, setTokens, setUser } from "@/lib/constants";

// Accounts created for someone who subscribed on the handset carry this until
// they tell us their name. Kept in step with the API.
const PLACEHOLDER_NAME = "Super Awoof Player";

function OTPForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsName, setNeedsName] = useState(false);
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(text)) {
      const digits = text.split("");
      setOtp(digits);
      refs[3].current?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.some((d) => d === "")) {
      showToast("Please fill in all 4 digits.", "error");
      return;
    }
    try {
      setLoading(true);
      const storedEndpoint = localStorage.getItem("verifyEndpoint") || "/account/verify-otp";
      const isNewAccount = localStorage.getItem("isNewAccount") === "true";
      const phone = localStorage.getItem("pendingPhone");
      const email = localStorage.getItem("pendingEmail");
      const emailOrPhone = phone || email;

      if (!emailOrPhone) {
        showToast("Session expired. Please sign in again.", "error");
        router.push("/auth/signin");
        return;
      }

      const response = await axios.post(`${baseUrl}${storedEndpoint}`, { 
        otp: otp.join(""), 
        emailOrPhone 
      });

      if (response.status === 200) {
        const { accessToken, refreshToken, account } = response.data;
        if (accessToken) {
          setTokens(accessToken, refreshToken);
          setUser(account);
          localStorage.setItem("loginTimestamp", Date.now().toString());

          // Subscribers who paid on the handset never gave us a name, so ask
          // for it here rather than greeting them as "Super Awoof Player".
          if (account?.fullname === PLACEHOLDER_NAME) {
            setNeedsName(true);
            showToast("Verified! One last thing.", "success");
            return;
          }

          showToast(isNewAccount ? "Account created successfully!" : "Logged in successfully!", "success");
          setTimeout(() => router.push("/dashboard"), 1200);
        } else {
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
      const email = localStorage.getItem("pendingEmail");

      if (phone) {
        await axios.post(`${baseUrl}/account/signin/phone`, { phone });
        showToast("Code resent to your phone!", "success");
      } else if (email) {
        await axios.post(`${baseUrl}/account/send-otp`, { emailOrPhone: email });
        showToast("Code resent to your email!", "success");
      } else {
        showToast("Contact details not found. Please sign in again.", "error");
        router.push("/auth/signin");
      }
    } catch {
      showToast("Failed to resend code. Try again.", "error");
    } finally {
      setResending(false);
    }
  };

  const saveName = async () => {
    if (fullName.trim().length < 3) {
      showToast("Please enter your full name.", "error");
      return;
    }

    try {
      setSavingName(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `${baseUrl}/account/update/profile`,
        { fullname: fullName.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const account = res.data?.data ?? res.data;
      if (account) setUser(account);
      showToast("Welcome to Super Awoof!", "success");
      setTimeout(() => router.push("/dashboard"), 900);
    } catch {
      // The account is already usable, so a failure here must not trap them.
      showToast("Saved. You can update your name in Profile.", "success");
      setTimeout(() => router.push("/dashboard"), 900);
    } finally {
      setSavingName(false);
    }
  };

  if (needsName) {
    return (
      <div className="auth-screen">
        <div
          className="card"
          style={{
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: "100%",
            maxWidth: 420,
          }}
        >
          <div>
            <h1 className="font-display" style={{ fontSize: 28, color: "white", marginBottom: 8 }}>
              What should we call you?
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              Your subscription is active and your coins are ready. Just your
              name and you can play.
            </p>
          </div>

          <Input
            label="Full Name"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Button text="Start playing" onClick={saveName} isLoading={savingName} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      {/* Two-column wrapper */}
      <div className="auth-cols">

        {/* Left – Branding (desktop only) */}
        <div
          className="desktop-only"
          style={{
            flex: "0 0 50%",
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
              One step<br />away.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 340 }}>
              Enter the 4-digit code we sent to your phone or email to verify your identity.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 16 }}>
            {["Secure verification", "Instant access", "Provably fair"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} className="pulse-dot" />
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right – Form card */}
        <div className="auth-form-col">
          <div
            className="card auth-form-card"
            style={{
              flex: "0 0 50%",
              display: "flex",
              flexDirection: "column",
              gap: 28,
              padding: "40px 32px",
              width: "100%",
            }}
          >
          {/* Mobile: logo centered */}
          <div className="mobile-only" style={{ justifyContent: "center", marginBottom: 4 }}>
            <Image
              src="/images/favicon.png"
              alt="Super Awoof"
              width={56}
              height={56}
              style={{ borderRadius: 16, height: "auto" }}
            />
          </div>

          {/* Heading */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h2 className="font-display" style={{ fontSize: 26, color: "white" }}>
              Verification Code
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              Check your phone or email for your 4-digit OTP.
            </p>
          </div>

          {/* OTP digit boxes */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", width: "100%" }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={refs[i]}
                id={`otp-digit-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoComplete="one-time-code"
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                style={{
                  width: 64,
                  height: 72,
                  flexShrink: 0,
                  background: "var(--surface-2)",
                  border: `2px solid ${digit ? "var(--green)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 16,
                  color: "white",
                  fontSize: 28,
                  fontWeight: 700,
                  textAlign: "center",
                  outline: "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--green)";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(29,185,84,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = digit ? "var(--green)" : "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Button text="Verify OTP" onClick={handleVerify} isLoading={loading} />
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
              Didn&apos;t receive a code?{" "}
              <button
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--green)",
                  fontWeight: 700,
                  opacity: resending ? 0.5 : 1,
                }}
              >
                {resending ? "Resending..." : "Resend"}
              </button>
            </p>
          </div>

          {/* Divider + back */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, textAlign: "center" }}>
            <button
              onClick={() => router.back()}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              ← Go back
            </button>
          </div>
          </div>
        </div>
      </div>
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
