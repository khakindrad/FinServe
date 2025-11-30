import { useEffect, useState } from "react";
import {api} from "@/lib/api";

export function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.GetCountry()
      .then((res) => setCountries(res.data || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return { countries, loading, reload: load };
}
