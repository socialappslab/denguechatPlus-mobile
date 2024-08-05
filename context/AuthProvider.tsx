import { ReactNode, createContext, useEffect } from "react";
import { useContext, useState } from "react";
import { router, useSegments } from "expo-router";
import { IUser } from "../schema/auth";
import { useStorageState } from "../hooks/useStorageState";
import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  REFRESH_TOKEN_LOCAL_STORAGE_KEY,
} from "../constants/Keys";

type AuthProviderType = {
  user: IUser | null;
  loadingToken: boolean;
  token: string | null;
  loadingRefreshToken: boolean;
  refreshToken: string | null;
  setUser: (user: IUser | null) => void;
  login: (token: string, refreshToken: string, user: IUser) => boolean;
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
  loadingToken: false,
  token: null,
  loadingRefreshToken: false,
  refreshToken: null,
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
  const [[loadingToken, token], setToken] = useStorageState(
    ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  );
  const [[loadingRefreshToken, refreshToken], setRefreshToken] =
    useStorageState(REFRESH_TOKEN_LOCAL_STORAGE_KEY);

  const login = (token: string, refreshToken: string, user: IUser) => {
    setUser(user);
    setToken(token);
    setRefreshToken(refreshToken);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  useProtectedRoute(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingToken,
        token,
        loadingRefreshToken,
        refreshToken,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
