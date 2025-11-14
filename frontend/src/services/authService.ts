// src/services/authService.ts
import axiosClient from "@/lib/axiosClient";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export const authService = {
  login: async (email: string ,password:string) => {
    //var data: LoginRequest1 = { email, password }; 
    const response = await axiosClient.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (data: {firstName, middleName, lastName, dob, email, mobile, country, state, city, zip, password}) => {
    const response = await axiosClient.post("/auth/register", data);
    return response.data;
  },
  getProfile: async () => {
    const response = await axiosClient.get("/auth/profile");
    return response.data;
  },
};
