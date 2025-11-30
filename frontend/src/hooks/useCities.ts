import { useEffect, useState } from "react";
import {api} from "@/lib/api";

export function useCities() {
  const [cities, setcities] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.GetAllCity()
      .then((res) => setcities(res.data || []))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  return { cities, loading, reload: load };
}
