import { storage } from "@/utils/storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number | null;
  name: string | null;
  school: string | null;
  gradYear: number | null;
};

type AuthContextType = {
  accessToken: string | null;
  user: User | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = await storage.getItem("token");
      const storedUser = await storage.getItem("user");

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    };

    restoreSession();
  }, []);

  const logout = async () => {
    await storage.removeItem("token");
    await storage.removeItem("user");
    setAccessToken(null);
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, user, setAccessToken, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
