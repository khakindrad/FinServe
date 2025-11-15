"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/auth";
import { getToken, setToken, clearToken } from "@/lib/token-store";

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (d: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTok] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // SKIP LOGIN (DEV MODE)
  useEffect(() => {
    const skip = process.env.NEXT_PUBLIC_SKIP_LOGIN === "true";

    if (skip) {
      const autoUser = { id: "dev", name: "Dev User", email: "dev@test.com" };
      setUser(autoUser);
      setTok("dev-token");
      return;
    }
  }, []);

  // Restore session
  useEffect(() => {
    const tok = getToken();
    const usr = localStorage.getItem("user");

    if (tok && usr) {
      setTok(tok);
      setUser(JSON.parse(usr));
    }

    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    setTok(data.token);
    setUser(data.user);

    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/admin";
  }

  async function register(d: any) {
    await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(d),
    });
  }

  function logout() {
    clearToken();
    localStorage.removeItem("user");
    setUser(null);
    setTok(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
