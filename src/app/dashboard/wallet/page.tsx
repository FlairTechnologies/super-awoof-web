"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/Button";
import { TabBar } from "@/components/TabBar";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, getAccessToken } from "@/lib/constants";
import { X, ChevronLeft } from "lucide-react";

function WalletContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [balance, setBalance] = useState("0");
  const [banks, setBanks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    axios.get(`${baseUrl}/wallet`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setBalance(r.data.balance))
      .catch(() => {});
    axios.get(`${baseUrl}/wallet/banks`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setBanks(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      const token = getAccessToken();
      axios.get(`${baseUrl}/wallet/confirm-account?accountNo=${accountNumber}&bankCode=${selectedBank}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => setBeneficiaryName(r.data?.data?.account_name || "Invalid Account"))
        .catch(() => setBeneficiaryName("Error retrieving name"));
    } else {
      setBeneficiaryName("");
    }
  }, [accountNumber, selectedBank]);

  const handleWithdraw = async () => {
    if (!selectedBank || !accountNumber || !amount) {
      showToast("Please fill all fields.", "error");
      return;
    }
    try {
      setLoading(true);
      const token = getAccessToken();
      const res = await axios.post(
        `${baseUrl}/wallet/withdraw`,
        { bankCode: selectedBank, bankName: selectedBank, accountNo: accountNumber, accountName: beneficiaryName, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res?.data?.message || "Withdrawal Successful!", "success");
      setShowModal(false);
      setAccountNumber(""); setAmount(""); setBeneficiaryName(""); setSelectedBank("");
      router.push("/dashboard");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Withdrawal failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container min-h-screen bg-[#0F1219] px-4 py-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white">
          <ChevronLeft size={26} />
        </button>
        <h1 className="text-white font-bold text-2xl mx-auto pr-8">Wallet</h1>
      </div>

      {/* Wallet Card */}
      <div
        className="relative w-full rounded-2xl overflow-hidden h-48"
        style={{ background: "linear-gradient(135deg, #00A859 0%, #004d29 100%)" }}
      >
        <Image src="/images/WalletBg.png" alt="" fill className="object-cover opacity-20" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
          <p className="text-white/80 text-sm mb-1">Wallet Balance</p>
          <p className="text-white text-5xl font-bold mb-6">₦{balance}</p>
          <Button
            text="Withdraw"
            onClick={() => setShowModal(true)}
            disabled={balance === "0"}
            className="max-w-[200px]"
          />
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#191B21] rounded-2xl p-6 w-full max-w-sm relative animate-fade-in">
            <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-[#A8A8A8] hover:text-white">
              <X size={22} />
            </button>
            <h2 className="text-white text-xl font-bold text-center mb-5">Confirm Withdrawal</h2>

            <div className="flex flex-col gap-4">
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="input-field bg-[#282C34]"
              >
                <option value="">Select Bank</option>
                {banks.map((b: any) => (
                  <option key={b.id} value={b.code}>{b.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Enter Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                className="input-field bg-[#282C34]"
              />

              {beneficiaryName && (
                <p className="text-[#00A859] text-sm text-center font-medium">{beneficiaryName}</p>
              )}

              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field bg-[#282C34]"
              />

              <Button text="Withdraw" onClick={handleWithdraw} loading={loading} />
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}

export default function WalletPage() {
  return (
    <ToastProvider>
      <WalletContent />
    </ToastProvider>
  );
}
