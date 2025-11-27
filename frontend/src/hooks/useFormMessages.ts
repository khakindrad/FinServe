"use client";
import { useState, useEffect } from "react";

export function useFormMessages() {
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  // Auto-clear after 3 seconds
  useEffect(() => {
    if (errorMsg || successMsg || alertMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
        setAlertMsg("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  return { errorMsg, setErrorMsg, successMsg, setSuccessMsg ,alertMsg, setAlertMsg};
}
