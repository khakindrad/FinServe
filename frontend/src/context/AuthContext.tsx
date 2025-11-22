// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import { useInitAuth } from "@/hooks/useInitAuth";
type AuthContextType = {
  user: any | null;
  isAuthenticated: boolean;
  setUser: (u: any | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useInitAuth();
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // try to load current user. api.me() will send cookies
    async function load() {
      try {
        const res = await api.me();
        if (res && res.user) {
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

  async function logout() {
    try {
      await api.logout(); // backend should clear cookie
    } catch (err) {
      // ignore
    } finally {
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
      // navigate to login - let consumer handle redirect or use router
      if (typeof window !== "undefined") window.location.href = "/login";
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
