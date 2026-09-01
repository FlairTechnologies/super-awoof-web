"use client";
import React, { useEffect, useState } from "react";
import { getUser } from "@/lib/constants";
import { canDeposit } from "@/lib/features";

const buildFaqs = (depositAvailable: boolean) => [
  {
    question: "How do I play Super Awoof?",
    answer: "Playing is simple! Go to the 'Play' tab on your dashboard, make sure you have coins, and click 'Spin'. Every spin consumes 1 coin and gives you a chance to match symbols and win cash prizes."
  },
  depositAvailable
    ? {
        question: "How do I deposit coins or subscribe?",
        answer: "You can deposit coins by tapping your balance on the top right or navigating to the 'Wallet' / 'Deposit' options. For MTN users, you can subscribe automatically by sending 'SA1' to 20138 on your mobile device."
      }
    : {
        question: "How do I get coins?",
        answer: "Send 'SA1' to 20138 from your MTN line to subscribe. Coins are credited to your account automatically each time your subscription renews."
      },
  {
    question: "How do I withdraw my winnings?",
    answer: "Go to your 'Wallet' page, select 'Withdraw', and enter your bank details. Winnings are processed between the 25th and the end of every month."
  },
  {
    question: "Is Super Awoof fair and secure?",
    answer: "Absolutely. Super Awoof uses a provably fair system powered by random number generation and is built on a highly secure web and API stack to protect your funds and personal information."
  }
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [depositAvailable, setDepositAvailable] = useState(false);

  useEffect(() => {
    setDepositAvailable(canDeposit(getUser()));
  }, []);

  const faqs = buildFaqs(depositAvailable);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="app-screen anim-fade-up" style={{ padding: "24px 20px 80px", overflowY: "auto" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
          <h1 className="font-display" style={{ fontSize: 28, color: "white" }}>
            Help & Support
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            Find answers to common questions and learn how to use Super Awoof.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Support Card */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 className="font-display" style={{ fontSize: 18, color: "white" }}>
            Need direct assistance?
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
            Our customer support team is available 24/7. Reach out via email or join our community channel.
          </p>
          <a
            href="mailto:support@superawoof.ng"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 52,
              borderRadius: 14,
              background: "var(--green)",
              color: "white",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              transition: "filter 0.2s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          >
            Email Support
          </a>
        </div>

        {/* FAQs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 className="font-display" style={{ fontSize: 18, color: "white", marginBottom: 4 }}>
            Frequently Asked Questions
          </h3>

          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="card"
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: isOpen ? 12 : 0,
                  transition: "all 0.2s ease",
                  background: isOpen ? "var(--surface-2)" : "var(--surface)"
                }}
                onClick={() => toggleFaq(index)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
                    {faq.question}
                  </span>
                  <span style={{ color: "var(--green)", fontSize: 18, fontWeight: 700 }}>
                    {isOpen ? "−" : "+"}
                  </span>
                </div>
                {isOpen && (
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}
