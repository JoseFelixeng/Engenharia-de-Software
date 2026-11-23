import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { me } from "./mockApi.js";
import {
  lerToken,
  gravarToken,
  gravarUsuario,
  limparSessao,
} from "./tokenStorage.js";

export { lerToken, gravarToken, limparSessao };

const AuthContext = createContext(null);

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
        if (ativo) {
          setUsuario(u);
          gravarUsuario(u);
        }
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
    gravarUsuario(u || null);
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
  return {
    usuario: null,
    carregando: false,
    setUser: () => {},
    logout: () => {},
  };
}