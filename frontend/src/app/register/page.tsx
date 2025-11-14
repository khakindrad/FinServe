"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "@/services/authService";
import { RegisterRequest } from "@/services/authService";
import router from "next/router";
export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError("");
     //if (!validateForm()) return; // Stop if validation fails
     setLoading(true);
     try {
      var data = {firstName, middleName, lastName, dob, email, mobile, country, state, city, zip, password};
       const response = await authService.register(data);
       if (response) router.push("/login");
     } catch (err: any) {
       setError("Somthing went wrong. Please try again.");
     } finally {
       setLoading(false);
     }
   };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-gray-50 p-4">
      <Card className="w-full max-w-2xl p-8 rounded-2xl shadow-2xl overflow-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-900 mb-2">Create Account</CardTitle>
          {/* General Error */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

        </CardHeader>
        
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>

            {/* Personal Details */}
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-10" required />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="pl-10" />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="relative mt-4">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} className="pl-10" />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Contact Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input type="tel" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="pl-10" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="pl-10" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="pl-10" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="Zip Code" value={zip} onChange={(e) => setZip(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Password</h3>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg mt-4">

              {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving Data...
                  </>
                ) : (
                  "Register"
                )}
            </Button>
          </form>

          {msg && <p className="mt-4 text-center text-blue-700 font-medium">{msg}</p>}

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?
            <Link href="/login" className="text-blue-600 font-medium ml-1 hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
