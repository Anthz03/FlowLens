import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!getToken());

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  useEffect(() => {
    if (getToken()) api.me().then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setReady(true));
    window.addEventListener('flowlens:unauthorized', logout);
    return () => window.removeEventListener('flowlens:unauthorized', logout);
  }, [logout]);

  const start = ({ token, user: u }) => { setToken(token); setUser(u); return u; };
  const login = async (email, password) => start(await api.login({ email, password }));
  const register = async (form) => start(await api.register(form));

  return <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}
