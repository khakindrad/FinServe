import { create } from "zustand";

interface MenuItem {
  id: number;
  name: string;
  route: string;
  icon: string;
  order: number;
  children: MenuItem[];
}

interface User {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
  menus: MenuItem[];
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
