"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export const Input = ({ label, placeholder, type = "text", value, onChange, error }: InputProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label className="label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${error ? "border-[#FF4D4D]" : ""}`}
      />
      {error && <span style={{ fontSize: 12, color: "var(--danger)", paddingLeft: 4 }}>{error}</span>}
    </div>
  );
};

export const PasswordInput = ({ label, placeholder, value, onChange, error }: InputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label className="label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input ${error ? "border-[#FF4D4D]" : ""}`}
          style={{ paddingRight: 56 }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)",
            display: "flex", alignItems: "center",
          }}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <span style={{ fontSize: 12, color: "var(--danger)", paddingLeft: 4 }}>{error}</span>}
    </div>
  );
};
