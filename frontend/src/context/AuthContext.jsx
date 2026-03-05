import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem('ap_token');
  if (!token) { setLoading(false); return; }

  authAPI.me()
  .then(data => setUser(data.user))
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
  const data = await authAPI.login({ username, password });

  if (!data?.token) {
    throw new Error(data?.message || "Login sin token");
  }

  localStorage.setItem("ap_token", data.token);
  setUser(data.user);

  return data.user;
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
