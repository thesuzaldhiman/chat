"use client";

import React from "react";
import { useNotifications } from "@/context/NotificationContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";
        const isWarning = toast.type === "warning";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl bg-white text-[#0F172A] animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? "border-emerald-200 ring-1 ring-emerald-500/10"
                : isError
                ? "border-rose-200 ring-1 ring-rose-500/10"
                : isWarning
                ? "border-amber-200 ring-1 ring-amber-500/10"
                : "border-[#E2E8F0] ring-1 ring-[#2563EB]/10"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-[#2563EB]" />}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-xs font-bold text-[#0F172A] mb-0.5">
                  {toast.title}
                </p>
              )}
              <p className="text-xs text-[#475569] leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-slate-400 hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
