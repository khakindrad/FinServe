"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { validateField } from "@/lib/validators";
import { patterns } from "@/lib/patterns";
import { useRouter } from "next/navigation";

export function useRegistration(setErrorMsg: any, setSuccessMsg: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ***** FORM SUBMIT FUNCTION *****
  async function registerUser(form: any) {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const payload = {
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        gender: form.gender === "M" ? "Male" : form.gender === "F" ? "Female" : "Other", // matches enum Gender
        dateOfBirth: form.dateOfBirth, // DateOnly string, e.g., "2025-11-23"
        firstName: form.firstName.trim(),
        middleName: form.middleName ? form.middleName.trim() : null, // optional
        lastName: form.lastName.trim(),
        countryId: Number(form.countryId), // must be numeric ID
        stateId: Number(form.stateId),     // must be numeric ID
        cityId: Number(form.cityId),       // must be numeric ID
        address: form.address.trim(),
        pinCode: form.pinCode.trim(),
        password: form.password,
      };
      await api.register(payload); // <-- IMPORTANT: Correct API call
      setSuccessMsg("Account created successfully!");
      // Redirect after short delay
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong, please try later.");
    }
    setLoading(false);
  }
  return { registerUser, loading };
}
