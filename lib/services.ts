import api from "./api";
import type {
  Restaurant,
  Branch,
  Manager,
  Owner,
  BranchTariff,
  RestaurantTariff,
  TariffFeature,
  TariffLog,
} from "@/types";

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

// ─── TARIFFLAR ────────────────────────────────────────────────
export const tariffApi = {
  // Config (secret key)
  getConfig: () =>
    api.get<{
      success: boolean;
      data: { configured: boolean; updated_at: string | null };
    }>("/tariffs/config"),

  setConfig: (data: { new_secret_key: string; current_secret_key?: string }) =>
    api.post("/tariffs/config", data),

  // Barcha filial tariflari
  getBranchTariffs: (restaurant_id?: string) =>
    api.get<{ success: boolean; data: BranchTariff[] }>("/tariffs/branches", {
      params: restaurant_id ? { restaurant_id } : {},
    }),

  getBranchTariff: (branchId: string) =>
    api.get<{
      success: boolean;
      data: { tariff: BranchTariff | null; features: TariffFeature[] };
    }>(`/tariffs/branches/${branchId}`),

  assignBranch: (
    branchId: string,
    data: {
      tariff_type: "light" | "standard";
      expires_at?: string | null;
      secret_key: string;
      note?: string;
    },
  ) => api.post(`/tariffs/branches/${branchId}/assign`, data),

  extendBranch: (
    branchId: string,
    data: { new_expires_at: string; secret_key: string; note?: string },
  ) => api.put(`/tariffs/branches/${branchId}/extend`, data),

  revokeBranch: (
    branchId: string,
    data: { secret_key: string; note?: string },
  ) => api.delete(`/tariffs/branches/${branchId}/revoke`, { data }),

  // Restoran (premium)
  getRestaurantTariff: (restaurantId: string) =>
    api.get<{ success: boolean; data: RestaurantTariff | null }>(
      `/tariffs/restaurants/${restaurantId}`,
    ),

  assignRestaurantPremium: (
    restaurantId: string,
    data: { expires_at?: string | null; secret_key: string; note?: string },
  ) => api.post(`/tariffs/restaurants/${restaurantId}/assign`, data),

  extendRestaurant: (
    restaurantId: string,
    data: { new_expires_at: string; secret_key: string; note?: string },
  ) => api.put(`/tariffs/restaurants/${restaurantId}/extend`, data),

  // Loglar
  getLogs: (params?: {
    target_id?: string;
    target_type?: string;
    limit?: number;
  }) =>
    api.get<{ success: boolean; data: TariffLog[] }>("/tariffs/logs", {
      params,
    }),
};
