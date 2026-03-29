import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "./types";

interface AppState {
  // Auth
  user: AuthUser | null;
  /**
   * In-memory token only — NOT persisted to localStorage.
   * The real session is maintained by the httpOnly `hrms_token` cookie
   * set by the server. This field is kept for legacy API calls that
   * still send an Authorization header, and is cleared on logout.
   */
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Theme
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;

}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      theme: "dark",
      setTheme: (theme) => set({ theme }),


    }),
    {
      name: "hrms-store",
      partialize: (state) => ({
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
        // ⚠️ token is intentionally excluded — session is managed via
        //    httpOnly cookie. Storing the JWT in localStorage is an XSS risk.
        theme:           state.theme,

      }),
    }
  )
);
