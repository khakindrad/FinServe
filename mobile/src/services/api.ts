import axios from "axios";

const api = axios.create({
  baseURL: "https://your-backend-api-url/api",
});

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", res.data.accessToken);
  return res.data;
}

// frontend/lib/api.ts
export async function getProfile() {
    return axios.get('/api/user/profile');
}

export async function updateProfile(data) {
    return axios.put('/api/user/profile', data);
}

// api/location.ts
export async function getCountries() {
    return axios.get("/api/location/countries");
}
export async function getStates(countryId: number) {
    return axios.get(`/api/location/states/${countryId}`);
}
export async function getCities(stateId: number) {
    return axios.get(`/api/location/cities/${stateId}`);
}