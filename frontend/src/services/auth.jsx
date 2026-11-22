import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { me } from "./mockApi.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "morada_token";
const USER_KEY = "morada_usuario";

export function lerToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
}

export function gravarToken(token, lembrar = true) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  if (!token) return;
  if (lembrar) localStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.setItem(TOKEN_KEY, token);
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    const token = lerToken();
    if (!token) {
      setCarregando(false);
      return () => {
        ativo = false;
      };
    }
    me(token)
      .then((u) => {
        if (ativo) setUsuario(u);
      })
      .catch(() => {
        limparSessao();
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const setUser = useCallback((u) => {
    setUsuario(u || null);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    limparSessao();
  }, []);

  const value = useMemo(
    () => ({ usuario, carregando, setUser, logout }),
    [usuario, carregando, setUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook de autenticação. Seguro fora do provider (retorna estado vazio). */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx) return ctx;
  return { usuario: null, carregando: false, setUser: () => {}, logout: () => {} };
}