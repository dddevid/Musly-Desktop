import React, { createContext, useContext, useState, useEffect } from "react";
import type { SubsonicConfig } from "../services/subsonic";
import { setConfig, ping } from "../services/subsonic";

interface AuthState {
  isAuthenticated: boolean;
  config: SubsonicConfig | null;
  login: (config: SubsonicConfig) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "musly_config";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [config, setConfigState] = useState<SubsonicConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const cfg: SubsonicConfig = JSON.parse(saved);
        setConfig(cfg);
        setConfigState(cfg);
        ping().then(ok => {
          if (ok) setIsAuthenticated(true);
          else localStorage.removeItem(STORAGE_KEY);
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async (cfg: SubsonicConfig): Promise<boolean> => {
    setConfig(cfg);
    const ok = await ping();
    if (ok) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
      setConfigState(cfg);
      setIsAuthenticated(true);
    }
    return ok;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setConfigState(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, config, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
