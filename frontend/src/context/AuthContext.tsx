"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getAccessToken, getRefreshToken, logoutUser } from "@/lib/auth";
import { refreshAccessToken } from "@/lib/refreshClient";

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  setUser: (u: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const refresh = getRefreshToken();

    if (token) {
      setIsAuthenticated(true);
    } else if (refresh) {
      refreshAccessToken().then((newToken) => {
        if (newToken) setIsAuthenticated(true);
      });
    }
  }, []);

  function logout() {
    logoutUser();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
