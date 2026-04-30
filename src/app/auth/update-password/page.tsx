"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { PasswordInput } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";

const UPDATE_URL = "https://super-awoof-d6b48f0a17a5.herokuapp.com/api/v1/account/update/password";

function UpdatePasswordForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    try {
      setLoading(true);
      const email = localStorage.getItem("passwordEmailReset");
      const response = await axios.put(UPDATE_URL, {
        email,
        old_password: oldPassword,
        new_password: newPassword,
      });
      if (response.status === 200) {
        showToast("Password updated successfully!", "success");
        setTimeout(() => router.push("/auth/signin"), 1200);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container min-h-screen bg-[#0F1219] px-5 py-8 animate-fade-in">
      <div className="flex justify-center mb-8 mt-4">
        <Image src="/images/favicon.png" alt="Super Awoof" width={48} height={48} />
      </div>

      <div className="mb-8">
        <h1 className="text-white font-bold text-[27px]">Update Password</h1>
        <p className="text-white/70 text-base mt-2 leading-relaxed">
          Please enter your old password and your new password.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <PasswordInput
          label="Old Password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <PasswordInput
          label="New Password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordInput
          label="Confirm New Password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="mt-10">
        <Button text="Update Password" onClick={handleUpdate} loading={loading} />
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <ToastProvider>
      <UpdatePasswordForm />
    </ToastProvider>
  );
}
