"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { User, Mail, Phone, Flag, MapPin, Lock, Eye, EyeOff } from "lucide-react";
import AppAlert from "@/components/common/AppAlert";
import { useRegistration } from "@/hooks/useRegistration";
import { useFormMessages } from "@/hooks/useFormMessages";
import { validateField } from "@/lib/validators";
import { patterns } from "@/lib/patterns";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
export default function RegisterForm() {
  
  const router = useRouter();
  const { errorMsg, setErrorMsg, successMsg, setSuccessMsg } = useFormMessages();
  const { registerUser, loading } = useRegistration(setErrorMsg, setSuccessMsg);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState({
    email: "",
    mobile: "",
    gender: "",
    dateOfBirth: "",
    firstName: "",
    middleName: "",
    lastName: "",
    countryId: "",
    stateId: "",
    cityId: "",
    address: "",
    pinCode: "",
    password: "",
  });
  // Dropdown data
  const [gender, setGender] = useState<{ id: number; name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  //Load Genders
  useEffect(()=>
  {
     api.GetGender().then((res)=> {
        setGender(res.data);
     }).catch((err) => {
      console.error("Error fetching Genders:", err);
    });
  },[])
  // Load countries on mount
  useEffect(() => {
    api.GetCountry()
      .then((res) => {
        setCountries(res.data);
      })
      .catch((err) => {
        console.error("Error fetching countries:", err);
      });
  }, []);
  

  // Load states when country changes
  useEffect(() => {
    if (!form.countryId) return;
    api.GetState(form.countryId)
      .then((res) => {
        const stateData = res?.data;
        const stateList = stateData ? [stateData] : [];
        setStates(stateList);
      })
      .catch((err) => {
        console.error("Error fetching states:", err);
      });
  }, [form.countryId]);

  // Load cities when state changes
  useEffect(() => {
    if (!form.stateId) {
      setCities([]);
      setForm((prev) => ({ ...prev, cityId: "" }));
      return;
    }
    api.GetCity(form.stateId)
      .then((res) =>
        {
        const CitiesData = res?.data;
        const CityList = CitiesData ? [CitiesData] : [];
        setCities(CityList);
        } )
      .catch(console.error);

    setForm((prev) => ({ ...prev, cityId: "" }));
  }, [form.stateId]);


  async function handleSubmit(e: any) {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");

    let newErrors: any = {};
    const validations = [
      { field: "email", label: "Email", pattern: patterns.email },
      { field: "mobile", label: "Phone", pattern: patterns.phone },
      { field: "gender", label: "Gender", pattern: patterns.id },
      { field: "dateOfBirth", label: "Date of Birth", pattern: patterns.dob },
      { field: "firstName", label: "First Name", pattern: patterns.name },
      { field: "lastName", label: "Last Name", pattern: patterns.name },
      { field: "countryId", label: "Country", pattern: patterns.id},
      { field: "stateId", label: "State", pattern: patterns.id },
      { field: "cityId", label: "City", pattern: patterns.id},
      { field: "pinCode", label: "Zip Code", pattern: patterns.pinCode },
      { field: "address", label: "Full Address", pattern: patterns.address },
      { field: "password", label: "Password", pattern: patterns.password },
    ];
    console.log(form);
    validations.forEach(({ field, label, pattern }) => {
      const result = validateField(form[field], label, pattern);
      if (result) newErrors[field] = result;
    });

    const errorCount = Object.keys(newErrors).length;
    if (errorCount > 0) {
      setErrors(newErrors);
      if (errorCount === 1) {
        setErrorMsg(String(Object.values(newErrors)[0]));
      }
      return;
    }
    const res=await registerUser(form);
    if(res)
    {
      router.push("/login");
    }
  }

  return (
    <form className="space-y-10 px-2" onSubmit={handleSubmit}>
      {errorMsg && <AppAlert type="error" message={errorMsg} />}
      {successMsg && <AppAlert type="success" message={successMsg} />}

      {/* PERSONAL DETAILS */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Personal Details</h3>
        <div className="grid md:grid-cols-4 gap-4">
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
            {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
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
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
          </div>

          {/* GENDER */}
          <div>
            <label className="text-sm font-medium">Gender</label>
            <select
              className={`w-full py-2 pl-3 pr-3 border rounded-md bg-white ${errors.gender ? "border-red-500" : ""
                }`}
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="">Select Gender</option>
              {gender.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
          </div>
        </div>

        {/* DOB */}
        <div className="mt-4">
          <label className="text-sm font-medium">Date of Birth</label>
          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            className={`${errors.dateOfBirth ? "border-red-500" : ""}`}
          />
          {errors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{errors.dateOfBirth}</p>}
        </div>
      </section>

      {/* CONTACT DETAILS */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Contact Details</h3>
        <div className="space-y-4">
          {/* EMAIL */}
          <div className="relative">
            <label className="text-sm font-medium">Email</label>
            <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* PHONE */}
          <div className="relative">
            <label className="text-sm font-medium">Phone Number</label>
            <Phone className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
            <Input
              type="tel"
              value={form.mobile}
              onChange={(e) => updateField("mobile", e.target.value)}
              className={`pl-10 ${errors.mobile ? "border-red-500" : ""}`}
            />
            {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
          </div>
        </div>
      </section>

      {/* ADDRESS DETAILS */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Address Details</h3>
        <div className="mt-4">
          <label className="text-sm font-medium">Full Address</label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Xyz near abc."
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className={`pl-10 ${errors.address ? "border-red-500" : ""}`}
            />
          </div>
          {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {/* COUNTRY */}
          {/* COUNTRY */}
          <div className="mt-4">
            <label className="text-sm font-medium">Country</label>
            <select
              className={`w-full py-2 pl-3 pr-3 border rounded-md bg-white ${errors.countryId ? "border-red-500" : ""}`}
              value={form.countryId}
              onChange={(e) => updateField("countryId", e.target.value)}
            >
              <option value="">Select Country</option>
              {countries.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.countryId && <p className="text-xs text-red-600 mt-1">{errors.countryId}</p>}
          </div>

          {/* STATE */}
          <div className="mt-4">
            <label className="text-sm font-medium">State</label>
            <select
              className={`w-full py-2 pl-3 pr-3 border rounded-md bg-white ${errors.stateId ? "border-red-500" : ""}`}
              value={form.stateId}
              onChange={(e) => updateField("stateId", e.target.value)}
              disabled={!states.length}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.stateId && <p className="text-xs text-red-600 mt-1">{errors.stateId}</p>}
          </div>

          {/* CITY */}
          <div className="mt-4">
            <label className="text-sm font-medium">City</label>
            <select
              className={`w-full py-2 pl-3 pr-3 border rounded-md bg-white ${errors.cityId ? "border-red-500" : ""}`}
              value={form.cityId}
              onChange={(e) => updateField("cityId", e.target.value)}
              disabled={!cities.length}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.cityId && <p className="text-xs text-red-600 mt-1">{errors.cityId}</p>}
          </div>
        </div>

        {/* ZIP */}
        <div className="mt-4">
          <label className="text-sm font-medium">Zip Code</label>
          <Input
            placeholder="400001"
            value={form.pinCode}
            onChange={(e) => updateField("pinCode", e.target.value)}
            className={`w-full py-2 pl-3 pr-3 border rounded-md ${errors.pinCode ? "border-red-500" : ""
              }`}
          />
          {errors.pinCode && <p className="text-xs text-red-600 mt-1">{errors.pinCode}</p>}
        </div>
      </section>

      {/* SECURITY */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Security</h3>
        <div className="relative">
          <label className="text-sm font-medium">Password</label>
          <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <Input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className={`pl-10 pr-12 ${errors.password ? "border-red-500" : ""}`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
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
