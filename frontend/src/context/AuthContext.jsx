import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem('ap_token');
  if (!token) { setLoading(false); return; }

  authApi.me()
    .then(r => {
      // r.data = { ok:true, user:{...} }
      setUser(r.data.user);
    })
    .catch(() => {
      localStorage.removeItem('ap_token');
      setUser(null);
    })
    .finally(() => setLoading(false));
}, []);

const login = useCallback(async (username, password) => {
  const res = await authApi.login({ username, password });
  // res.data = { ok:true, token:'...', user:{...} }

  if (!res.data?.ok) {
    throw new Error(res.data?.message || 'Credenciales incorrectas');
  }

  localStorage.setItem('ap_token', res.data.token);
  setUser(res.data.user);
  return res.data.user;
}, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ap_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
