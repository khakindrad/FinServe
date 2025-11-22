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

    let errors: string[] = [];

    // ***** VALIDATION *****
    const validations = [
      validateField(form.firstName, "First Name", patterns.name),
      validateField(form.lastName, "Last Name", patterns.name),
      validateField(form.email, "Email", patterns.email),
      validateField(form.password, "Password", patterns.strongPassword),
      validateField(form.phone, "Phone", patterns.phone),
      validateField(form.dob, "Date of Birth", patterns.dob),
      validateField(form.country, "Country", patterns.country),
      validateField(form.state, "State", patterns.country),
      validateField(form.city, "City", patterns.country),
      validateField(form.zip, "Zip Code", patterns.pinCode),
    ];

    validations.forEach((v) => {
      if (v) errors.push(v);
    });

    // Show all errors in alert
    if (errors.length > 0) {
      setErrorMsg(errors.join("\n"));
      setLoading(false);
      return;
    }

    try {
      // ***** API REQUEST *****
      const payload = {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        dob: form.dob,
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country,
        state: form.state,
        city: form.city,
        zip: form.zip.trim(),
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
