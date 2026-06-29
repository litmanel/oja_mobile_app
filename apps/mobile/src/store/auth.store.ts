import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'oja_access_token';
const REFRESH_TOKEN_KEY = 'oja_refresh_token';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: 'vendor' | 'buyer' | 'admin' | null;
  vendorId: string | null;
  isNewVendor: boolean;
  isLoading: boolean;

  /** Persist tokens to SecureStore and update Zustand state */
  setAuth: (params: {
    accessToken: string;
    refreshToken: string;
    role: 'vendor' | 'buyer';
    vendorId?: string | null;
    isNewVendor?: boolean;
  }) => Promise<void>;

  /** Load tokens from SecureStore on app launch */
  loadTokens: () => Promise<void>;

  /** Clear tokens from SecureStore and Zustand state */
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  role: null,
  vendorId: null,
  isNewVendor: false,
  isLoading: true,

  setAuth: async ({ accessToken, refreshToken, role, vendorId, isNewVendor }) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({
      accessToken,
      refreshToken,
      role,
      vendorId: vendorId || null,
      isNewVendor: isNewVendor || false,
    });
  },

  loadTokens: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      set({
        accessToken,
        refreshToken,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({
      accessToken: null,
      refreshToken: null,
      role: null,
      vendorId: null,
      isNewVendor: false,
    });
  },
}));
