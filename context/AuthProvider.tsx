import { ReactNode, createContext, useEffect } from "react";
import { useContext, useState } from "react";
import { router, useSegments } from "expo-router";
import { IUser } from "../schema/auth";
import { useStorageState } from "../hooks/useStorageState";

type AuthProviderType = {
  user: IUser | null;
  token: string | null;
  setUser: (user: IUser | null) => void;
  login: (token: string, user: IUser) => boolean;
  logout: () => void;
};

function useProtectedRoute(user: IUser | null) {
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!user && inAuthGroup) {
      router.replace("/login");
    } else if (user && !inAuthGroup) {
      router.replace("/(auth)/(tabs)/");
    }
  }, [user, segments]);
}

export const AuthContext = createContext<AuthProviderType>({
  user: null,
  token: null,
  login: () => false,
  setUser: (user: IUser | null) => {},
  logout: () => {},
});

export function useAuth() {
  if (!useContext(AuthContext)) {
    throw new Error("useAuth must be used within a <AuthProvider />");
  }

  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [[isLoading, token], setToken] = useStorageState("token");

  const login = (token: string, user: IUser) => {
    console.log("login>>", token);
    setUser(user);

    return true;
  };

  const logout = () => {
    setUser(null);
  };

  useProtectedRoute(user);

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
