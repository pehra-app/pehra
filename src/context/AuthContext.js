import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import {
  startNotificationSession,
  stopNotificationSession,
} from '../services/notifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, storedUser] = await Promise.all([
          AsyncStorage.getItem('pehra_token'),
          AsyncStorage.getItem('pehra_user'),
        ]);
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  useEffect(() => {
    let active = true;
    if (!user || user.role !== 'DEALER') {
      stopNotificationSession();
      return undefined;
    }

    AsyncStorage.getItem('pehra_token').then(token => {
      if (active && token) startNotificationSession(token);
    });

    return () => {
      active = false;
      stopNotificationSession();
    };
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    try {
      await Promise.all([
        AsyncStorage.setItem('pehra_token', data.token),
        AsyncStorage.setItem('pehra_user', JSON.stringify(data.user)),
      ]);
    } catch (error) {
      console.warn(
        'Login succeeded, but the session could not be saved.',
        error,
      );
    }
    setUser(data.user);
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem('pehra_token'),
      AsyncStorage.removeItem('pehra_user'),
    ]);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, booting, login, logout }),
    [user, booting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
