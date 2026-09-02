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

  // Adopt a token we already hold (e.g. returned by /auth/reset-password).
  const adoptToken = useCallback(async (token) => {
    setToken(token);
    const me = await client.get("/auth/me");
    setParent(me.data);
  }, []);

  // Re-read the current parent (e.g. after confirming email).
  const refreshParent = useCallback(async () => {
    if (!getToken()) return;
    const me = await client.get("/auth/me");
    setParent(me.data);
  }, []);

  const value = {
    parent,
    loading,
    isAuthenticated: !!parent,
    login,
    signup,
    logout,
    adoptToken,
    refreshParent,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
