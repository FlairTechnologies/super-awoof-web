"use client";
import React, { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  /** Lets the browser offer the value it already knows (name, number, email). */
  autoComplete?: string;
  /** Picks the on-screen keyboard: "numeric" and "tel" matter most here. */
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal" | "search" | "url" | "none";
  /**
   * Run when the user presses Enter, or the "Go" key on a phone keyboard.
   *
   * Without this the key does nothing, and the visitor has to dismiss the
   * keyboard to reach a button the keyboard may well be covering.
   */
  onEnter?: () => void;
  autoFocus?: boolean;
  maxLength?: number;
}

export const Input = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  inputMode,
  onEnter,
  autoFocus,
  maxLength,
}: InputProps) => {
  // Ties the label to the field so screen readers announce it and a tap on
  // the label focuses the input.
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        inputMode={inputMode}
        autoFocus={autoFocus}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className={`input ${error ? "border-[#FF4D4D]" : ""}`}
      />
      {error && (
        <span id={errorId} style={{ fontSize: 12, color: "var(--danger)", paddingLeft: 4 }}>
          {error}
        </span>
      )}
    </div>
  );
};

export const PasswordInput = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  onEnter,
}: InputProps) => {
  const [show, setShow] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          className={`input ${error ? "border-[#FF4D4D]" : ""}`}
          style={{ paddingRight: 56 }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // A 44px box is the smallest reliably tappable target.
            width: 44,
            height: 44,
          }}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && (
        <span id={errorId} style={{ fontSize: 12, color: "var(--danger)", paddingLeft: 4 }}>
          {error}
        </span>
      )}
    </div>
  );
};
