"use client";
import React from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmVariant?: "primary" | "danger";
  children?: React.ReactNode;
}

export const Modal = ({
  visible,
  onClose,
  title,
  subtitle,
  confirmText,
  cancelText = "No, Cancel",
  onConfirm,
  confirmVariant = "primary",
  children,
}: ModalProps) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A8A8A8] hover:text-white transition-colors"
        >
          <X size={22} />
        </button>
        <h2 className="text-white text-xl font-semibold mb-3 pr-8">{title}</h2>
        {subtitle && (
          <p className="text-[#A8A8A8] text-[15px] mb-4 leading-relaxed">{subtitle}</p>
        )}
        {children}
        <Button text={confirmText} onClick={onConfirm} variant={confirmVariant} className="mt-4" />
        <button
          onClick={onClose}
          className="w-full text-center text-white underline mt-3 text-[15px] py-1"
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
};
