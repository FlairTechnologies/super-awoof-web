"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl } from "@/lib/constants";
import { attributionPayload } from "@/lib/attribution";

/**
 * MVAS landing page for paid traffic.
 *
 * Subscription is billed by the carrier and is completed outside the browser,
 * by SMS keyword or USSD. The number is collected here so the click that paid
 * for this visitor can be banked against it: MTN's billing callback carries
 * only an MSISDN, so without this step the subscription cannot be attributed.
 */

const PLANS = [
  { pcode: "2224", name: "Weekly", price: 200, validity: "7 days", coins: 20 },
  { pcode: "2225", name: "Monthly", price: 500, validity: "30 days", coins: 50 },
  { pcode: "2223", name: "Daily", price: 100, validity: "1 day", coins: 5 },
];

function SubscribeForm() {
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [pcode, setPcode] = useState("2225");
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState<{
    msg: string;
    shortCode: string;
    ussd: string;
  } | null>(null);

  const selected = PLANS.find((p) => p.pcode === pcode) ?? PLANS[1];

  const handleSubscribe = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
      showToast("Please enter a valid 10 or 11-digit MTN number.", "error");
      return;
    }

    const attribution = attributionPayload();
    if (!attribution.txid || !attribution.pubid) {
      // Nothing to attribute: still let them subscribe, just send them straight
      // to the carrier routes rather than recording a click that does not exist.
      setInstructions({
        msg: `To start playing, dial *920*20138# or text SA1 to 20138.`,
        shortCode: "20138",
        ussd: "*920*20138#",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}/mno/subscribe`, {
        phone: cleanPhone,
        pcode,
        ...attribution,
      });
      const data = response.data?.data ?? response.data;
      setInstructions({
        msg: data.msg,
        shortCode: data.shortCode ?? "20138",
        ussd: data.ussd ?? "*920*20138#",
      });
    } catch (error: unknown) {
      const message =
        (axios.isAxiosError(error) &&
          (error.response?.data?.message || error.response?.data?.error)) ||
        "Could not start your subscription. Please try again.";
      showToast(message, "error");
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
          style={{ flexDirection: "column", justifyContent: "center", padding: "60px 48px", gap: 32 }}
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
              Spin.<br />Win.<br />Repeat.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 340 }}>
              Subscribe on MTN and get coins every cycle to play with.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 16 }}>
            {["Charged to your MTN airtime", "Coins credited automatically", "Stop anytime"].map((f) => (
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
          style={{
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: "100%",
            maxHeight: "90dvh",
            overflowY: "auto",
          }}
        >
          <div className="mobile-only text-center mb-2 flex-col">
            <h1 className="font-display" style={{ fontSize: 32, color: "white", marginBottom: 8 }}>
              Start playing
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Subscribe with your MTN number</p>
          </div>

          <div className="desktop-only flex-col">
            <h2 className="font-display" style={{ fontSize: 24, color: "white", marginBottom: 4 }}>
              Subscribe
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Billed to your MTN airtime</p>
          </div>

          {instructions ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 15, color: "white", lineHeight: 1.6 }}>{instructions.msg}</p>
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Dial</div>
                <div className="font-display" style={{ fontSize: 26, color: "var(--green)" }}>
                  {instructions.ussd}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  or text <strong style={{ color: "white" }}>SA1</strong> to{" "}
                  <strong style={{ color: "white" }}>{instructions.shortCode}</strong>
                </div>
              </div>
              <a
                href={`tel:${instructions.ussd}`}
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  color: "var(--green)",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Open dialler
              </a>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Choose a plan</span>
                {PLANS.map((plan) => {
                  const active = plan.pcode === pcode;
                  return (
                    <button
                      key={plan.pcode}
                      onClick={() => setPcode(plan.pcode)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 16px",
                        borderRadius: 12,
                        cursor: "pointer",
                        textAlign: "left",
                        background: active ? "rgba(0,200,120,0.08)" : "transparent",
                        border: `1px solid ${active ? "var(--green)" : "var(--border)"}`,
                      }}
                    >
                      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 15, color: "white", fontWeight: 700 }}>{plan.name}</span>
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>
                          {plan.coins} coins · {plan.validity}
                        </span>
                      </span>
                      <span className="font-display" style={{ fontSize: 18, color: active ? "var(--green)" : "white" }}>
                        ₦{plan.price}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Input
                label="MTN Phone Number"
                placeholder="0803 000 0000"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Button
                text={`Subscribe for ₦${selected.price}`}
                onClick={handleSubscribe}
                isLoading={loading}
              />

              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, textAlign: "center" }}>
                MTN numbers only. Renews every {selected.validity} until you stop.
                Text STOP to 20138 to cancel.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <ToastProvider>
      <SubscribeForm />
    </ToastProvider>
  );
}
