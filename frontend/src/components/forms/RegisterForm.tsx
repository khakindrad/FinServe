"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-10 px-2">

      {/* ======================================================
            PERSONAL DETAILS
      ====================================================== */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Personal Details</h3>

        <div className="grid md:grid-cols-3 gap-4">
          {/* First Name */}
          <div>
            <label className="text-sm font-medium">First Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input placeholder="John" className="pl-10" />
            </div>
          </div>

          {/* Middle Name */}
          <div>
            <label className="text-sm font-medium">Middle Name</label>
            <Input placeholder="M." className="mt-1" />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input placeholder="Doe" className="pl-10" />
            </div>
          </div>
        </div>

        {/* DOB */}
        <div className="mt-4">
          <label className="text-sm font-medium">Date of Birth</label>
          <Input type="date" className="mt-1" />
        </div>
      </section>

      {/* ======================================================
            CONTACT DETAILS
      ====================================================== */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Contact Details</h3>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input type="email" placeholder="you@example.com" className="pl-10" />
          </div>
        </div>

        {/* Phone */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input type="tel" placeholder="+91 98765 43210" className="pl-10" />
          </div>
        </div>
      </section>

      {/* ======================================================
            ADDRESS DETAILS
      ====================================================== */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Address Details</h3>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Country */}
          <div>
            <label className="text-sm font-medium">Country</label>
            <div className="relative mt-1">
              <Flag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select className="w-full pl-10 pr-3 py-2 border rounded-md bg-white">
                <option>India</option>
                <option>Nepal</option>
                <option>USA</option>
                <option>Canada</option>
              </select>
            </div>
          </div>

          {/* State */}
          <div>
            <label className="text-sm font-medium">State</label>
            <select className="w-full mt-1 py-2 border rounded-md bg-white">
              <option>Maharashtra</option>
              <option>Karnataka</option>
              <option>Delhi</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-medium">City</label>
            <select className="w-full mt-1 py-2 border rounded-md bg-white">
              <option>Mumbai</option>
              <option>Bangalore</option>
              <option>Delhi</option>
            </select>
          </div>
        </div>

        {/* ZIP */}
        <div className="mt-4">
          <label className="text-sm font-medium">Zip Code</label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input placeholder="400001" className="pl-10" />
          </div>
        </div>
      </section>

      {/* ======================================================
            PASSWORD / SECURITY
      ====================================================== */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Security</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-12"
            />

            {/* Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Submit */}
      <Button className="w-full h-12 text-lg">Create Account</Button>

      {/* Login Link */}
      <div className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Login
        </Link>
      </div>
    </div>
  );
}
