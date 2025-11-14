"use client";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CountryStateCitySelect() {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  // ✅ Fetch countries on load
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states");
        const data = await res.json();
        if (data?.data) setCountries(data.data);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    }
    fetchCountries();
  }, []);

  // ✅ Handle Country Change
  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedState("");
    setCities([]);

    // Find selected country object safely
    const country = countries.find((c) => c.name === countryName);

    // Handle if states are not available
    const stateList = country?.states ? country.states.map((s: any) => s.name) : [];
    setStates(stateList);
  };

  // ✅ Handle State Change (Fetch Cities API)
  const handleStateChange = async (stateName: string) => {
    setSelectedState(stateName);
    setCities([]); // reset

    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry, state: stateName }),
      });

      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) setCities(data.data);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Country */}
      <Select onValueChange={handleCountryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {countries.map((c) => (
            <SelectItem
              key={`${c.name}-${c.iso3 || Math.random()}`} // ✅ unique key fix
              value={c.name}
            >
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* State */}
      <Select
        disabled={!states.length}
        onValueChange={handleStateChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select State" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {states.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* City */}
      <Select disabled={!cities.length}>
        <SelectTrigger>
          <SelectValue placeholder="Select City" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
