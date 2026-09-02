"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { X, Search, Check, ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { baseUrl, getAccessToken } from "@/lib/constants";

export const MIN_WITHDRAWAL = 100;

const LAST_BENEFICIARY_KEY = "lastBeneficiary";

interface Bank {
  id?: string | number;
  code: string;
  name: string;
}

interface Beneficiary {
  bankCode: string;
  bankName: string;
  accountNo: string;
  accountName: string;
}

export interface WithdrawPayload extends Beneficiary {
  amount: number;
}

interface Resolution {
  key: string;
  status: "loading" | "ok" | "error";
  name?: string;
  error?: string;
}

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  balance: number;
  banks: Bank[];
  loading: boolean;
  onSubmit: (payload: WithdrawPayload) => Promise<boolean>;
}

const readLastBeneficiary = (): Beneficiary | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_BENEFICIARY_KEY);
    return raw ? (JSON.parse(raw) as Beneficiary) : null;
  } catch {
    return null;
  }
};

const naira = (n: number) =>
  `₦${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Withdrawal flow, built for the subscriber audience: most arrive from the MTN
 * short code on a phone, with no saved profile beyond an MSISDN. So the bank
 * list is searchable rather than a 200-row native picker, the account name must
 * resolve before we let the transfer through, and the last account used is
 * offered back as a one-tap repeat. Payload and endpoint are unchanged.
 */
export const WithdrawModal = ({ visible, ...props }: WithdrawModalProps) => {
  // Mounting the body only while open resets every field on each open, with no
  // synchronising effect to keep in step.
  if (!visible) return null;
  return <WithdrawModalBody {...props} />;
};

const WithdrawModalBody = ({
  onClose,
  balance,
  banks,
  loading,
  onSubmit,
}: Omit<WithdrawModalProps, "visible">) => {
  const [saved] = useState<Beneficiary | null>(() => readLastBeneficiary());
  const [step, setStep] = useState<"details" | "review">("details");
  const [bankQuery, setBankQuery] = useState("");
  const [pickingBank, setPickingBank] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [resolved, setResolved] = useState<Resolution | null>(null);
  const [usingSaved, setUsingSaved] = useState<boolean>(() => saved !== null);

  const bankName = useMemo(
    () => banks.find((b) => b.code === bankCode)?.name ?? "",
    [banks, bankCode]
  );

  // The account being resolved, as a single key, so a result can be matched to
  // the input it came from and stale responses simply never apply.
  const resolveKey = bankCode && accountNumber.length === 10 ? `${bankCode}:${accountNumber}` : "";
  const current = resolved?.key === resolveKey ? resolved : null;
  const resolveState: "idle" | "loading" | "ok" | "error" = !resolveKey
    ? "idle"
    : current?.status ?? "loading";
  const accountName = current?.name ?? "";
  const resolveError = current?.error ?? "";

  // Resolve the account name from the bank + account number.
  useEffect(() => {
    if (!resolveKey) return;
    let cancelled = false;
    const token = getAccessToken();
    axios
      .get(`${baseUrl}/wallet/confirm-account?accountNo=${accountNumber}&bankCode=${bankCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => {
        if (cancelled) return;
        const name = r.data?.data?.account_name;
        setResolved(
          name
            ? { key: resolveKey, status: "ok", name }
            : { key: resolveKey, status: "error", error: "We couldn't find that account. Check the number and bank." }
        );
      })
      .catch(() => {
        if (cancelled) return;
        setResolved({
          key: resolveKey,
          status: "error",
          error: "We couldn't verify that account. Check the number and bank.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [resolveKey, accountNumber, bankCode]);

  const amountNum = Number(amount);
  const amountError =
    amount === ""
      ? ""
      : !Number.isFinite(amountNum) || amountNum <= 0
      ? "Enter a valid amount."
      : amountNum < MIN_WITHDRAWAL
      ? `The smallest withdrawal is ${naira(MIN_WITHDRAWAL)}.`
      : amountNum > balance
      ? `That's more than your balance of ${naira(balance)}.`
      : "";

  const canContinue = resolveState === "ok" && amount !== "" && !amountError;

  const filteredBanks = useMemo(() => {
    const q = bankQuery.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter((b) => b.name?.toLowerCase().includes(q));
  }, [banks, bankQuery]);

  const applySaved = (b: Beneficiary) => {
    setBankCode(b.bankCode);
    setAccountNumber(b.accountNo);
    setUsingSaved(false);
  };

  const handleConfirm = async () => {
    const payload: WithdrawPayload = {
      bankCode,
      bankName,
      accountNo: accountNumber,
      accountName,
      amount: amountNum,
    };
    const ok = await onSubmit(payload);
    if (!ok) return;
    try {
      localStorage.setItem(
        LAST_BENEFICIARY_KEY,
        JSON.stringify({ bankCode, bankName, accountNo: accountNumber, accountName })
      );
    } catch {
      // A full or blocked localStorage must not break a successful payout.
    }
  };

  const quickAmounts = [1000, 5000, Math.floor(balance)].filter(
    (v, i, arr) => v >= MIN_WITHDRAWAL && v <= balance && arr.indexOf(v) === i
  );

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 px-4"
      style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="modal-card animate-fade-in"
        style={{ width: "100%", maxWidth: 420, padding: 28, position: "relative", maxHeight: "88vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A8A8A8] hover:text-white transition-colors"
        >
          <X size={22} />
        </button>

        {step === "review" ? (
          <>
            <button
              onClick={() => setStep("details")}
              className="text-[#A8A8A8] hover:text-white transition-colors"
              style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16, fontSize: 14 }}
            >
              <ChevronLeft size={18} /> Back
            </button>
            <h2 className="text-white text-xl font-bold font-display mb-2">Confirm Withdrawal</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Check these details carefully. Transfers cannot be reversed once sent.
            </p>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(29, 185, 84, 0.2)",
                background: "rgba(29, 185, 84, 0.04)",
                padding: 24,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              <p className="label" style={{ marginBottom: 8 }}>You are withdrawing</p>
              <p className="font-display" style={{ fontSize: 36, color: "white", lineHeight: 1.1 }}>
                {naira(amountNum)}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {[
                { k: "Account Name", v: accountName },
                { k: "Bank", v: bankName },
                { k: "Account Number", v: accountNumber },
                { k: "Balance After", v: naira(Math.max(balance - amountNum, 0)) },
              ].map((row) => (
                <div key={row.k} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontSize: 13, color: "var(--muted)", flexShrink: 0 }}>{row.k}</span>
                  <span style={{ fontSize: 14, color: "white", fontWeight: 700, textAlign: "right" }}>{row.v}</span>
                </div>
              ))}
            </div>

            <Button text="Send to my bank" onClick={handleConfirm} isLoading={loading} />
          </>
        ) : pickingBank ? (
          <>
            <button
              onClick={() => setPickingBank(false)}
              className="text-[#A8A8A8] hover:text-white transition-colors"
              style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16, fontSize: 14 }}
            >
              <ChevronLeft size={18} /> Back
            </button>
            <h2 className="text-white text-xl font-bold font-display mb-4">Choose your bank</h2>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search
                size={18}
                style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}
              />
              <input
                autoFocus
                className="input"
                style={{ paddingLeft: 52 + "px" }}
                placeholder="Search banks"
                value={bankQuery}
                onChange={(e) => setBankQuery(e.target.value)}
              />
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredBanks.length === 0 && (
                <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                  No bank matches “{bankQuery}”.
                </p>
              )}
              {filteredBanks.map((b) => (
                <button
                  key={b.id ?? b.code}
                  onClick={() => {
                    setBankCode(b.code);
                    setPickingBank(false);
                    setBankQuery("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    width: "100%",
                    minHeight: 52,
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "1px solid var(--border)",
                    background: b.code === bankCode ? "rgba(29, 185, 84, 0.08)" : "rgba(255,255,255,0.02)",
                    color: "white",
                    fontSize: 15,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span>{b.name}</span>
                  {b.code === bankCode && <Check size={18} style={{ color: "var(--green)", flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-white text-xl font-bold font-display mb-2">Withdraw Funds</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
              Available: <span style={{ color: "white", fontWeight: 700 }}>{naira(balance)}</span>
            </p>

            {saved && usingSaved && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
                <span className="label">Last account used</span>
                <button
                  onClick={() => applySaved(saved)}
                  style={{
                    width: "100%",
                    padding: "18px 20px",
                    borderRadius: 16,
                    border: "1px solid rgba(29, 185, 84, 0.25)",
                    background: "rgba(29, 185, 84, 0.05)",
                    color: "white",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 700 }}>{saved.accountName}</p>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                    {saved.bankName} · {saved.accountNo}
                  </p>
                </button>
                <button
                  onClick={() => setUsingSaved(false)}
                  style={{
                    height: 52,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Use a different account
                </button>
              </div>
            )}

            {!usingSaved && (
              <div className="flex flex-col gap-5">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span className="label">Bank</span>
                  <button
                    onClick={() => setPickingBank(true)}
                    className="input"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                      cursor: "pointer",
                      color: bankCode ? "white" : "var(--muted)",
                    }}
                  >
                    <span>{bankName || "Tap to choose your bank"}</span>
                    <Search size={18} style={{ color: "var(--muted)", flexShrink: 0 }} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span className="label">Account Number</span>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10 digits"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    className="input"
                  />
                  {resolveState === "loading" && (
                    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                      <Loader2 size={15} className="animate-spin" /> Checking account…
                    </p>
                  )}
                  {resolveState === "ok" && (
                    <p
                      className="animate-fade-in"
                      style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--green)" }}
                    >
                      <Check size={16} /> {accountName}
                    </p>
                  )}
                  {resolveState === "error" && (
                    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--danger)" }}>
                      <AlertCircle size={15} /> {resolveError}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span className="label">Amount</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={`Minimum ${naira(MIN_WITHDRAWAL)}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                    className="input"
                  />
                  {quickAmounts.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {quickAmounts.map((v) => (
                        <button
                          key={v}
                          onClick={() => setAmount(String(v))}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            border: "1px solid var(--border)",
                            background: "rgba(255,255,255,0.03)",
                            color: "rgba(255,255,255,0.75)",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {v === Math.floor(balance) ? "All" : `₦${v.toLocaleString()}`}
                        </button>
                      ))}
                    </div>
                  )}
                  {amountError && (
                    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--danger)" }}>
                      <AlertCircle size={15} /> {amountError}
                    </p>
                  )}
                </div>

                <Button text="Review Withdrawal" onClick={() => setStep("review")} disabled={!canContinue} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
