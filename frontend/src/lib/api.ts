// lib/api.ts
import { getAccessToken, setAccessToken, clearAccessToken } from "./auth";
import { refreshAccessToken } from "./refreshClient";
import { normalizeHeaders } from "./utils";

export const API_BASE_URL = "https://tzrhqvey9d.execute-api.us-east-1.amazonaws.com/prod/api";

// -----------------------------
// RAW REQUEST (no retry logic)
// -----------------------------
async function rawRequest(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const baseHeaders: Record<string, string> = {
    ...normalizeHeaders(options.headers || {}),
  };
  baseHeaders["Content-Type"] = "application/json";
  if (token) {
    baseHeaders["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: baseHeaders,
    credentials: "include", // send refresh cookie
  });

  return res;
}

// -----------------------------
// MAIN REQUEST WRAPPER
// -----------------------------
async function request(path: string, options: RequestInit = {}) {
  let res = await rawRequest(path, options);
  // 403 → Forbidden (capture message)
  if (res.status === 403) {
    let errMsg = "Account not approved or account lock";
    try {
      errMsg = await res.text();
    } catch {
      try {
        errMsg = await res.text(); // fallback if backend sends plain text
      } catch { }
    }
    throw new Error(errMsg);
  }
  // 2) If unauthorized → try refreshing access token
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      // retry again after token refresh
      res = await rawRequest(path, options);
    } else {
      clearAccessToken();
      throw new Error("Session expired. Please login again.");
    }
  }
  // 3) If still NOT OK → throw error
  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try {
      const errJson = await res.json();
      errMsg = errJson?.message || errJson?.error || errMsg;
    } catch { }
    throw new Error(errMsg);
  }
  // 4) Return JSON
  try {
    return await res.json();
  } catch {
    return null; // no body
  }
}
// -----------------------------
// EXPORT API METHODS
// -----------------------------
export const api = {

  /*
         ------------------------------Auth-----------------------------------------
  */

  login: (data: any) =>
    request("/Auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () =>
    request("/User/profile", {
      method: "GET",
    }),

  logout: () =>
    request("/Auth/logout", {
      method: "POST",
    }),

  refresh: () =>
    request("/Auth/refresh", {
      method: "POST",
    }),

  forgotPassword: () =>
    request("/Auth/forgot-password", {
      method: "POST",
    }),

  register: (data: any) =>
    request("/Auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /*
         ------------------------------User-----------------------------------------
  */
  getRoles: () =>
    request("/User/roles", { method: "GET" }),

  getModules: () =>
    request("/User/modules", { method: "GET" }),

  getMenu: () =>
    request("/User/Getmenu", {
      method: "GET",
    }),
  /*
         ------------------------------Admin-----------------------------------------
  */
  getLastModuleOrder: () =>
    request("/Admin/GetModulorder", { method: "GET" }),

  addModule: (payload: any) =>
    request("/Admin/Addmodules", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getLastActivityOrder: () =>
    request("/Admin/GetActivityOrder", { method: "GET" }),

  addActivity: (payload: any) =>
    request("/Admin/AddActivities", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /*
       ------------------------------API for Registration-----------------------------------------
*/
  GetCountry: () =>
    request("/location/countries", {
      method: "GET",
    }),

  // Get states by countryId
  GetState: (countryId: string | number) =>
    request(`/location/states/${countryId}`, {
      method: "GET",
    }),

  // Get cities by stateId
  GetCity: (stateId: string | number) =>
    request(`/location/cities/${stateId}`, {
      method: "GET",
    }),

  //Get Genders for registration
  GetGender: () =>
    request("/Master/genders", {
      method: "GET",
    }),
};

