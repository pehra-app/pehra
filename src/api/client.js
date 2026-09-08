import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emulator: http://10.0.2.2:5000/api
// iOS simulator: http://localhost:5000/api
// Physical device: use your computer's LAN IP.
// export const API_BASE_URL = 'http://10.0.2.2:5000/api';
export const API_BASE_URL = 'https://pehra-production.up.railway.app/api';
export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('pehra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
