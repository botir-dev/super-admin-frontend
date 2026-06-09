import api from "./api";
import type { Restaurant, Branch, Manager, Owner } from "@/types";

// ─── AUTH ────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),

  logout: (refresh_token: string) =>
    api.post("/auth/logout", { refresh_token }),

  changePassword: (old_password: string, new_password: string) =>
    api.put("/auth/change-password", { old_password, new_password }),
};

// ─── ADMIN — RESTORANLAR ─────────────────────────────────────
export const restaurantApi = {
  getAll: () =>
    api.get<{ success: boolean; data: Restaurant[] }>("/admin/restaurants"),

  create: (data: { name: string; address?: string; logo_url?: string }) =>
    api.post("/admin/restaurants", data),

  update: (
    id: string,
    data: {
      name?: string;
      address?: string;
      logo_url?: string;
      is_active?: boolean;
    },
  ) => api.put(`/admin/restaurants/${id}`, data),

  delete: (id: string) => api.delete(`/admin/restaurants/${id}`),
};

// ─── ADMIN — FILIALLAR ───────────────────────────────────────
export const branchApi = {
  getAll: (restaurant_id?: string) =>
    api.get<{ success: boolean; data: Branch[] }>("/admin/branches", {
      params: restaurant_id ? { restaurant_id } : {},
    }),

  create: (data: {
    restaurant_id: string;
    name: string;
    address?: string;
    phone?: string;
  }) => api.post("/admin/branches", data),

  update: (
    id: string,
    data: {
      name?: string;
      address?: string;
      phone?: string;
      is_active?: boolean;
    },
  ) => api.put(`/admin/branches/${id}`, data),
};

// ─── ADMIN — MENEJERLAR ──────────────────────────────────────
export const managerApi = {
  getAll: (restaurant_id?: string) =>
    api.get<{ success: boolean; data: Manager[] }>("/admin/managers", {
      params: restaurant_id ? { restaurant_id } : {},
    }),

  create: (data: {
    restaurant_id: string;
    branch_id: string;
    full_name: string;
    username: string;
    phone?: string;
    password: string;
    telegram_chat_id?: string;
  }) => api.post("/admin/managers", data),

  update: (
    id: string,
    data: Partial<Manager & { password?: string; telegram_chat_id?: string }>,
  ) => api.put(`/admin/managers/${id}`, data),

  delete: (id: string) => api.delete(`/admin/managers/${id}`),
};

// ─── ADMIN — OWNERLAR ────────────────────────────────────────
export const ownerApi = {
  getAll: (restaurant_id?: string) =>
    api.get<{ success: boolean; data: Owner[] }>("/admin/owners", {
      params: restaurant_id ? { restaurant_id } : {},
    }),

  create: (data: {
    restaurant_id: string;
    full_name: string;
    username: string;
    phone?: string;
    password: string;
    telegram_chat_id?: string;
  }) => api.post("/admin/owners", data),

  update: (
    id: string,
    data: {
      full_name?: string;
      phone?: string;
      is_active?: boolean;
      telegram_chat_id?: string;
    },
  ) => api.put(`/admin/owners/${id}`, data),

  delete: (id: string) => api.delete(`/admin/owners/${id}`),
};
