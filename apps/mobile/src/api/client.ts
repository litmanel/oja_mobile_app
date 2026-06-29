import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/auth.store';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Fallbacks for simulators
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/v1';
  }
  return 'http://localhost:3001/v1';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default apiClient;
