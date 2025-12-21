import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const PUBLIC_PREFIXES = [
  "/signup",
  "/signin",
  "/refresh",
  "/logout",
  "/resend-otp",
  "/verify-otp",
  "/setup-password",
  "/roles",
  "/stripe/webhook",
  "/learning",
];

api.interceptors.request.use(
  (config) => {
    const url = config.url ?? "";

    // Skip public routes
    if (PUBLIC_PREFIXES.some((prefix) => url.startsWith(prefix))) {
      return config;
    }

    // ✅ Attach tenant ID if exists
    if (typeof window !== "undefined") {
      // const tenantId = localStorage.getItem("currentTenantId");
      const tenantIdStr = localStorage.getItem("currentTenantId");
  if (tenantIdStr) {
    const tenantId = Number(tenantIdStr);
    config.headers["X-Tenant-ID"] = tenantId;
  }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect unauthenticated users
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("currentTenantId");
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
