import { ReactNode, createContext, useEffect, useState } from "react";
import { useContext } from "react";
import { router, useSegments } from "expo-router";
import { IUser } from "../schema/auth";
import { useStorageState } from "../hooks/useStorageState";
import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  REFRESH_TOKEN_LOCAL_STORAGE_KEY,
} from "../constants/Keys";
import { resetAuthApi, setAccessTokenToHeaders } from "../config/axios";
import useUser from "../hooks/useUser";

type AuthProviderType = {
  user: IUser | null;
  loadingToken: boolean;
  token: string | null;
  loadingRefreshToken: boolean;
  refreshToken: string | null;
  setUser: (user: IUser | null, updateLocalStorage: boolean) => void;
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
  const [[, userFromLocalStorage], setUserLocalStorage] = useUser();
  const [user, setLoadedUser] = useState<IUser | null>(null);

  const [[loadingToken, token], setToken] = useStorageState(
    ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  );
  const [[loadingRefreshToken, refreshToken], setRefreshToken] =
    useStorageState(REFRESH_TOKEN_LOCAL_STORAGE_KEY);

  useEffect(() => {
    setLoadedUser(userFromLocalStorage);
  }, [userFromLocalStorage]);

  const login = (token: string, refreshToken: string, user: IUser) => {
    setUserLocalStorage(user, true);
    setLoadedUser(user);
    setToken(token);
    setAccessTokenToHeaders(token);
    setRefreshToken(refreshToken);
    return true;
  };

  const logout = () => {
    setLoadedUser(null);
    setUserLocalStorage(null, true);
    resetAuthApi();
  };

  const setUser = (user: IUser | null, updateLocalStorage: boolean) => {
    setLoadedUser(user);
    setUserLocalStorage(user, updateLocalStorage);
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
