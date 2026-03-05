// ─── API client — todas las llamadas al backend ──────────

// ✅ Backend fijo (evita que caiga en "/api" del frontend)
const BASE = "https://autopartes-pro-1-backend-srid.onrender.com";

function getToken() {
  return localStorage.getItem("ap_token");
}

async function request(path, options = {}) {
  const token = getToken();

  // ✅ Construye URL segura: https://.../api + /auth/login = https://.../api/auth/login
  const url = `${BASE}/api${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  // ✅ Nunca usar res.json() directo
  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // si viene HTML o texto, lo guardamos como message
      data = { ok: false, message: text };
    }
  }

  // ✅ Errores claros
  if (!res.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      (text ? text.slice(0, 200) : `HTTP ${res.status}`)
    );
  }

  return data;
}

// ── Auth ────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  me: () => request("/auth/me"),
};

// ── Parts ───────────────────────────────────────────────
export const partsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== undefined)
      )
    ).toString();
    return request(`/parts${qs ? "?" + qs : ""}`);
  },
  stats: () => request("/parts/stats"),
  get: (id) => request(`/parts/${id}`),
  create: (data) =>
    request("/parts", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/parts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStock: (id, stock) =>
    request(`/parts/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ stock }),
    }),
  remove: (id) => request(`/parts/${id}`, { method: "DELETE" }),
};

// ── Categories ──────────────────────────────────────────
export const categoriesAPI = {
  list: () => request("/categories"),
};