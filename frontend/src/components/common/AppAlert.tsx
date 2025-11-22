"use client";

import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export default function AppAlert({ type, message }: { type: string; message: string }) {
  const styles = {
    error: {
      bg: "bg-red-50",
      border: "border-red-300",
      text: "text-red-700",
      icon: <XCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-300",
      text: "text-green-700",
      icon: <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />,
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      text: "text-yellow-700",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-700",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  };

  const selected = styles[type] ?? styles.error;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-md border ${selected.bg} ${selected.border}`}
    >
      {selected.icon}

      <p className={`text-sm font-medium whitespace-pre-line ${selected.text}`}>
        {message}
      </p>
    </div>
  );
}
