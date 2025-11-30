"use client";

import { useState, useEffect } from "react";
import {api} from "@/lib/api"
export function usePendingUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    const res = await api.getPendingUsers();
    //const json = await res.json();
    setUsers(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return { users, loading, reload: loadUsers };
}
