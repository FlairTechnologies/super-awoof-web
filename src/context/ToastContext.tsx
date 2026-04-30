"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({ message: "", type: "success", visible: false });

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <div
          className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};
