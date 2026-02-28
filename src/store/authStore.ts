import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services/api';

type User = { id: string; name: string; email: string; role: string } | null;

interface AuthState {
  user: User;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, refreshToken });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, refreshToken: null });
      },
      login: async (email, password) => {
        const res = await authApi.login({ email, password });
        const { user, tokens } = res.data;
        localStorage.setItem('accessToken', tokens.accessToken);
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      },
      register: async (name, email, password) => {
        const res = await authApi.register({ name, email, password });
        const { user, tokens } = res.data;
        localStorage.setItem('accessToken', tokens.accessToken);
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      },
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const res = await authApi.refresh(refreshToken);
          const { accessToken, refreshToken: newRefresh } = res.data;
          localStorage.setItem('accessToken', accessToken);
          set({ accessToken, refreshToken: newRefresh });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ refreshToken: s.refreshToken, user: s.user }) }
  )
);
