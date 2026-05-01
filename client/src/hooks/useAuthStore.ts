import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoggedIn: boolean;
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  isLoggedIn: false,
  setTokens: (accessToken, refreshToken, expiresIn) =>
    set({
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      isLoggedIn: true,
    }),
  logout: () =>
    set({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isLoggedIn: false,
    }),
}));
