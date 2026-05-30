import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict${secure}`;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => {
        localStorage.setItem("access_token", user.access_token);
        localStorage.setItem("refresh_token", user.refresh_token);
        setCookie("user_role", user.role, 7);
        setCookie("is_authenticated", "true", 7);
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          const refresh_token = localStorage.getItem("refresh_token");
          if (refresh_token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token }),
            });
          }
        } catch {
          // Tarmoq xatosida ham tozalanadi
        } finally {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("sa-auth");
          deleteCookie("user_role");
          deleteCookie("is_authenticated");
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "sa-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
