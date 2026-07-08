import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import axiosClient from '../api/axiosClient';

export interface AuthState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));

  const login = async (email: string, password: string) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    const { token, role } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setToken(token);
    setRole(role);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await axiosClient.post('/auth/register', { name, email, password });
    const { token, role } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setToken(token);
    setRole(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
