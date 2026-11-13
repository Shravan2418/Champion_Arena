const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let payload;
  try { payload = await response.json(); } catch { /* Response may be empty or non-JSON. */ }

  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function fetchCurrentUser() {
  const payload = await request("/api/auth/me");
  return payload?.data?.user ?? null;
}

export async function logoutSession() {
  return request("/api/auth/logout", { method: "POST" });
}
