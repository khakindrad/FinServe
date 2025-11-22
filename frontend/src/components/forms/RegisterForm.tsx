"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  User,
  Mail,
  Phone,
  Flag,
  MapPin,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import AppAlert from "@/components/common/AppAlert";
import { useRegistration } from "@/hooks/useRegistration";
import { useFormMessages } from "@/hooks/useFormMessages";
import { validateField } from "@/lib/validators";
import { patterns } from "@/lib/patterns";

export default function RegisterForm() {
  const { errorMsg, setErrorMsg, successMsg, setSuccessMsg } = useFormMessages();
  const { registerUser, loading } = useRegistration(setErrorMsg, setSuccessMsg);

  const [showPassword, setShowPassword] = useState(false);

  // Field Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    email: "",
    phone: "",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    zip: "",
    password: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");
  
    let newErrors: any = {};
    const validations = [
      { field: "firstName", label: "First Name", pattern: patterns.name },
      { field: "lastName", label: "Last Name", pattern: patterns.name },
      { field: "dob", label: "Date of Birth", pattern: patterns.dob },
      { field: "email", label: "Email", pattern: patterns.email },
      { field: "phone", label: "Phone", pattern: patterns.phone },
      { field: "country", label: "Country", pattern: patterns.country },
      { field: "state", label: "State", pattern: patterns.country },
      { field: "city", label: "City", pattern: patterns.country },
      { field: "zip", label: "Zip Code", pattern: patterns.pinCode },
      { field: "password", label: "Password", pattern: patterns.strongPassword },
    ];
    validations.forEach(({ field, label, pattern }) => {
      const result = validateField(form[field], label, pattern);
      if (result) newErrors[field] = result;
    });
    const errorCount = Object.keys(newErrors).length;
    if (errorCount > 0) {
      setErrors(newErrors);
  
      if (errorCount === 1) {
        setErrorMsg(String(Object.values(newErrors)[0]));
      } else {
        setErrorMsg(""); // No AppAlert for multiple errors
      }
      return;
    }
    await registerUser(form);
  }
  return (
    <form className="space-y-10 px-2" onSubmit={handleSubmit}>
      {errorMsg && <AppAlert type="error" message={errorMsg} />}
      {successMsg && <AppAlert type="success" message={successMsg} />}
      {/* PERSONAL DETAILS */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Personal Details</h3>

        <div className="grid md:grid-cols-3 gap-4">
          {/* FIRST NAME */}
          <div>
            <label className="text-sm font-medium">First Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

              <Input
                placeholder="John"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* MIDDLE NAME */}
          <div>
            <label className="text-sm font-medium">Middle Name</label>
            <Input
              placeholder="M."
              value={form.middleName}
              onChange={(e) => updateField("middleName", e.target.value)}
            />
          </div>

          {/* LAST NAME */}
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* DOB */}
        <div className="mt-4">
          <label className="text-sm font-medium">Date of Birth</label>
          <Input
            type="date"
            value={form.dob}
            onChange={(e) => updateField("dob", e.target.value)}
            className={`${errors.dob ? "border-red-500" : ""}`}
          />
          {errors.dob && <p className="text-xs text-red-600 mt-1">{errors.dob}</p>}
        </div>
      </section>

      {/* CONTACT DETAILS */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Contact Details</h3>

        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* PHONE */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
        </div>
      </section>

      {/* ADDRESS DETAILS */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Address Details</h3>

        <div className="grid md:grid-cols-3 gap-4">

          {/* COUNTRY */}
          <div>
            <label className="text-sm font-medium">Country</label>
            <div className="relative mt-1">
              <Flag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                className={`w-full pl-10 pr-3 py-2 border rounded-md bg-white ${
                  errors.country ? "border-red-500" : ""
                }`}
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
              >
                <option>India</option>
                <option>Nepal</option>
                <option>USA</option>
                <option>Canada</option>
              </select>
            </div>
            {errors.country && (
              <p className="text-xs text-red-600">{errors.country}</p>
            )}
          </div>

          {/* STATE */}
          <div>
            <label className="text-sm font-medium">State</label>
            <select
              className={`w-full mt-1 py-2 border rounded-md bg-white ${
                errors.state ? "border-red-500" : ""
              }`}
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
            >
              <option>Maharashtra</option>
              <option>Karnataka</option>
              <option>Delhi</option>
            </select>
            {errors.state && (
              <p className="text-xs text-red-600">{errors.state}</p>
            )}
          </div>

          {/* CITY */}
          <div>
            <label className="text-sm font-medium">City</label>
            <select
              className={`w-full mt-1 py-2 border rounded-md bg-white ${
                errors.city ? "border-red-500" : ""
              }`}
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            >
              <option>Mumbai</option>
              <option>Bangalore</option>
              <option>Delhi</option>
            </select>
            {errors.city && (
              <p className="text-xs text-red-600">{errors.city}</p>
            )}
          </div>
        </div>

        {/* ZIP */}
        <div className="mt-4">
          <label className="text-sm font-medium">Zip Code</label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="400001"
              value={form.zip}
              onChange={(e) => updateField("zip", e.target.value)}
              className={`pl-10 ${errors.zip ? "border-red-500" : ""}`}
            />
          </div>
          {errors.zip && <p className="text-xs text-red-600">{errors.zip}</p>}
        </div>
      </section>

      {/* SECURITY */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Security</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

            <Input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={`pl-10 pr-12 ${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password}</p>
          )}
        </div>
      </section>

      {/* Submit */}
      <Button disabled={loading} className="w-full h-12 text-lg">
        {loading ? "Creating..." : "Create Account"}
      </Button>

      {/* Login Link */}
      <div className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Login
        </Link>
      </div>
    </form>
  );
}
