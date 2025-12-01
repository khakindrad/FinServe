// lib/api.ts
import { getAccessToken, setAccessToken, clearAccessToken } from "./auth";
import { refreshAccessToken } from "./refreshClient";
import { normalizeHeaders } from "./utils";
//Base URL
export const API_BASE_URL = "https://tzrhqvey9d.execute-api.us-east-1.amazonaws.com/prod/api";//"http://54.81.12.127:5005/api";//"https://localhost:5005/api"; //"https://tzrhqvey9d.execute-api.us-east-1.amazonaws.com/prod/api"; //


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
  let errMsg = "";
  let res = await rawRequest(path, options);
  let result = await res.json();

  if (result.statusCode !== 200 && result.statusCode !== 201) {

    if (path === "/Auth/login") {
      if (result.statusCode === 403 &&
        (result.data.emailVerified
          || result.data.mobileVerified
        )) return result;
    }
    errMsg = result.message ?? "Something went wrong.";
    throw new Error(errMsg);
  }
  return result;
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

  forgotPassword: (email) =>
    request("/Auth/forgot-password", {
      method: "POST",
    }),

  register: (data: any) =>
    request("/Auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  emailVerification: (data: any) =>
    request("/Auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  mobileVerification: (data: any) =>
    request("/Auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  /*
         ------------------------------User-----------------------------------------
  */
  getRoles: () =>
    request("/Roles", { method: "GET" }),

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
  getPendingUsers: () =>
    request("/admin/pending-users", {
      method: "GET",
    }),
  /*
       ------------------------------Masters-----------------------------------------
*/
  GetCountry: () =>
    request("/Countries", {
      method: "GET",
    }),

  // Get states by countryId
  GetState: (countryId: string | number) =>
    request(`/States/${countryId}`, {
      method: "GET",
    }),
  GetAllState: () =>
    request(`/States`, {
      method: "GET",
    }),
  // Get cities by stateId
  GetCity: (stateId: string | number) =>
    request(`/Cities/${stateId}`, {
      method: "GET",
    }),
  GetAllCity: () =>
    request(`/Cities`, {
      method: "GET",
    }),
  //Get Genders for registration
  GetGender: () =>
    request("/Master/genders", {
      method: "GET",
    }),
  addCountrys: (data: any) =>
    request("/Countries", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addStates: (data: any) =>
    request("/States", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addCity: (data: any) =>
    request("/Cities", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addRoles: (data: any) =>
    request("/Roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

