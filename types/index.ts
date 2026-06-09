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
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
