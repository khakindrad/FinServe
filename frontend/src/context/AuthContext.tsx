"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";

type AuthContextType = {
  user: any | null;
  isAuthenticated: boolean;
  setUser: (u: any | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  setUser: () => { },
  logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.me(); // backend checks refresh token cookie

        if (res?.user) {
          setUser(res.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      }
    }

    load();
  }, []);
  // ⭐ FIX → UPDATE AUTH WHEN USER CHANGES
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  
  async function logout() {
    try {
      await api.logout(); // backend clears cookie
    } catch { }

    clearAccessToken();
    setUser(null);
    setIsAuthenticated(false);

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
