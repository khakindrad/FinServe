"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export function useInitAuth() {
  const { setUser } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        // Step 1 → get new access token using refresh cookie
        const refresh = await api.refresh();
        if (refresh?.accessToken) {
          setAccessToken(refresh.accessToken);
        }

        // Step 2 → get user details using access token
        const me = await api.me();
        console.log("Calling Me API:",me.user);
        if (me?.user) {
          setUser(me.user);
        }
      } catch (e) {
        console.log("Not authenticated");
      }
    }

    load();
  }, []);
}
