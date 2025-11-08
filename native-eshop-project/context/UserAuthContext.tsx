// native-eshop-project/context/UserAuthContext.tsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';
import { VariablesContext } from './VariablesContext';
import type { IUser } from '@/types/types';

/* === Types === */
interface BackendJwtPayload {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: string[];
  hasPassword: boolean;
  provider: 'backend';
  exp?: number;
}

interface UserAuthContextType {
  user: IUser | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/* === Default Context === */
export const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  isLoading: false,
  setIsLoading: () => {},
  setUser: () => {},
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
});

/* === Provider === */
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { url } = useContext(VariablesContext);

  /* === Helpers for SecureStore vs Web === */
  const getToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('token');
    }
    return await SecureStore.getItemAsync('token');
  };

  const setToken = async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
      return;
    }
    await SecureStore.setItemAsync('token', token);
  };

  const deleteToken = async (): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
      return;
    }
    await SecureStore.deleteItemAsync('token');
  };

  /* === Fetch user from token === */
  const fetchUserFromToken = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<BackendJwtPayload>(token);
      setUser({
        _id: decoded.id,
        username: decoded.username,
        name: decoded.name,
        email: decoded.email,
        roles: decoded.roles,
        hasPassword: decoded.hasPassword,
        provider: 'backend',
      });
    } catch (err) {
      console.error('❌ Invalid token, removing...', err);
      await deleteToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* === Login === */
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${url}/api/auth`, { username, password });

      if (res.data?.status && res.data.data?.token) {
        const token = res.data.data.token;
        await setToken(token);

        const decoded = jwtDecode<BackendJwtPayload>(token);
        setUser({
          _id: decoded.id,
          username: decoded.username,
          name: decoded.name,
          email: decoded.email,
          roles: decoded.roles,
          hasPassword: decoded.hasPassword,
          provider: 'backend',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('❌ Login failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /* === Logout === */
  const logout = async () => {
    await deleteToken();
    setUser(null);
  };

  /* === Refresh user === */
  const refreshUser = async () => {
    setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${url}/api/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.status && res.data.data?.token) {
        const newToken = res.data.data.token;
        await setToken(newToken);
        const decoded = jwtDecode<BackendJwtPayload>(newToken);
        setUser({
          _id: decoded.id,
          username: decoded.username,
          name: decoded.name,
          email: decoded.email,
          roles: decoded.roles,
          hasPassword: decoded.hasPassword,
          provider: 'backend',
        });
      }
    } catch (err) {
      console.error('⚠️ Failed to refresh token:', err);
      await deleteToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* === Init === */
  useEffect(() => {
    fetchUserFromToken();
  }, [fetchUserFromToken]);

  return (
    <UserAuthContext.Provider
      value={{ user, setUser, isLoading, setIsLoading, login, logout, refreshUser }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};
