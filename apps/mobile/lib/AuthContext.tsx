import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getToken, setToken, clearToken } from "./auth";

interface AuthState {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  signIn: (token: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken().then((t) => {
      if (t) {
        try {
          const payload = JSON.parse(atob(t.split(".")[1]));
          setTokenState(t);
          setUserId(payload.userId);
        } catch {
          clearToken();
        }
      }
      setIsLoading(false);
    });
  }, []);

  const signIn = async (newToken: string, newUserId: string) => {
    await setToken(newToken);
    setTokenState(newToken);
    setUserId(newUserId);
  };

  const signOut = async () => {
    await clearToken();
    setTokenState(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
