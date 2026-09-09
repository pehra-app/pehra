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
          const parsedUser = JSON.parse(storedUser);
          if (['DEALER', 'AGENT'].includes(parsedUser.role)) {
            setUser(parsedUser);
          } else {
            // Admin mobile sessions are intentionally discarded. The admin
            // role is supported by admin-web, not by the mobile app.
            await Promise.all([
              AsyncStorage.removeItem('pehra_token'),
              AsyncStorage.removeItem('pehra_user'),
            ]);
          }
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

    if (!['DEALER', 'AGENT'].includes(data.user?.role)) {
      // Admin login is retained by the API for admin-web and is disabled here.
      throw new Error('Admin accounts must use the admin web portal.');
    }

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
