export interface User {
  user_id: string;
  full_name: string;
  role: "super_admin";
  restaurant_id: string | null;
  branch_id: string | null;
  extra_permissions: string[];
  access_token: string;
  refresh_token: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Manager {
  id: string;
  full_name: string;
  username: string;
  phone: string;
  is_active: boolean;
  restaurant_id: string;
  branch_id: string;
  restaurant_name?: string;
  branch_name?: string;
  telegram_chat_id?: string;
  created_at?: string;
}

export interface Owner {
  id: string;
  full_name: string;
  username: string;
  phone: string;
  is_active: boolean;
  restaurant_id: string;
  restaurant_name?: string;
  telegram_chat_id?: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BranchTariff {
  id: string;
  branch_id: string;
  tariff_type: "light" | "standard" | "premium" | null;
  status:
    | "active"
    | "grace_period"
    | "expired"
    | "not_available"
    | "pending"
    | null;
  starts_at: string | null;
  expires_at: string | null;
  grace_ends_at: string | null;
  note: string | null;
  updated_at: string;
  branch_name?: string;
  definition_name?: string;
  restaurant_id?: string;
  restaurant_name?: string;
  assigned_by_name?: string;
}

export interface RestaurantTariff {
  id: string;
  restaurant_id: string;
  tariff_type: "premium";
  status: "active" | "grace_period" | "expired" | "not_available";
  starts_at: string | null;
  expires_at: string | null;
  grace_ends_at: string | null;
  note: string | null;
  updated_at: string;
  restaurant_name?: string;
}

export interface TariffFeature {
  key: string;
  label: string;
  enabled: boolean;
  locked: boolean;
}

export interface TariffLog {
  id: string;
  target_type: "branch" | "restaurant";
  target_id: string;
  action: "assign" | "extend" | "revoke" | "expire" | "grace_start";
  old_tariff: string | null;
  new_tariff: string | null;
  old_status: string | null;
  new_status: string | null;
  old_expires_at: string | null;
  new_expires_at: string | null;
  performed_by_name: string | null;
  note: string | null;
  created_at: string;
}
