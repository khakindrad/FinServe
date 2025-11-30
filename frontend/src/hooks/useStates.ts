import { useEffect, useState } from "react";
import {api} from "@/lib/api";

export function useStates() {
  const [states, setstates] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.GetAllState()
      .then((res) => setstates(res.data || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return { states, loading, reload: load };
}
