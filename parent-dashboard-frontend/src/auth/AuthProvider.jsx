import { useEffect, useState, useCallback } from "react";
import client from "../api/client";
import { getToken, setToken, clearToken } from "./token";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [parent, setParent] = useState(null);
  // "loading" until we've checked any existing token against the server.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await client.get("/auth/me");
        if (!cancelled) setParent(data);
      } catch {
        clearToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    // backend uses an OAuth2 password form: fields "username" + "password"
    const form = new URLSearchParams({ username: email, password });
    const { data } = await client.post("/auth/login", form);
    setToken(data.access_token);
    const me = await client.get("/auth/me");
    setParent(me.data);
  }, []);

  const signup = useCallback(async ({ email, password, name }) => {
    const { data } = await client.post("/auth/signup", {
      email,
      password,
      name: name || null,
    });
    setToken(data.access_token);
    const me = await client.get("/auth/me");
    setParent(me.data);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setParent(null);
  }, []);

  const value = { parent, loading, isAuthenticated: !!parent, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
