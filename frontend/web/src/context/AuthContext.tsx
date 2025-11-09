import React, { createContext, useState, useEffect } from "react";
import { login, logout } from "../services/authService";

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  const handleLogin = async (email: string, password: string) => {
    const data = await login(email, password);
    setUser(data.user);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
