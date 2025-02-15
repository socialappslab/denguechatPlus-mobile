import { ReactNode, createContext, useEffect, useState } from "react";
import { useContext } from "react";
import { router, useSegments } from "expo-router";
import useAxios from "axios-hooks";
import { ExistingDocumentObject, deserialize, CaseType } from "jsonapi-fractal";

import { IUser } from "@/schema/auth";
import { useStorageState } from "@/hooks/useStorageState";
import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  REFRESH_TOKEN_LOCAL_STORAGE_KEY,
} from "@/constants/Keys";
import { resetAuthApi, setAccessTokenToHeaders } from "@/config/axios";
import useUser from "@/hooks/useUser";
import { ErrorResponse } from "@/schema";
// import { Client } from "rollbar-react-native";
import { Platform } from "react-native";

type AuthProviderType = {
  user: IUser | null;
  meData: IUser | null;
  loadingToken: boolean;
  token: string | null;
  loadingRefreshToken: boolean;
  refreshToken: string | null;
  setUser: (user: IUser | null, updateLocalStorage: boolean) => void;
  login: (token: string, refreshToken: string, user: IUser) => boolean;
  logout: () => void;
  reFetchMe: () => void;
  // rollbar: Client | null;
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
  meData: null,
  loadingToken: false,
  token: null,
  loadingRefreshToken: false,
  refreshToken: null,
  reFetchMe: () => {},
  login: () => false,
  setUser: (user: IUser | null) => {},
  logout: () => {},
  // rollbar: null,
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
  const [meData, setMeData] = useState<IUser | null>(null);
  // const [rollbar, setRollbar] = useState<Client | null>(null);

  // const setRollbarClient = (person: {
  //   id: string;
  //   email?: string;
  //   username?: string;
  // }) => {
  //   if (Platform.OS !== "ios") {
  //     const client = new Client({
  //       accessToken: process.env.EXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN,
  //       captureUncaught: true,
  //       captureDeviceInfo: true,
  //       payload: person,
  //     });
  //     client.setPerson(person.id, undefined, person.email);
  //     setRollbar(client);
  //   }
  // };

  const [[loadingToken, token], setToken] = useStorageState(
    ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  );
  const [[loadingRefreshToken, refreshToken], setRefreshToken] =
    useStorageState(REFRESH_TOKEN_LOCAL_STORAGE_KEY);

  const [{ data: dataMe, error }, featchMe] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >(
    {
      url: `users/me`,
    },
    { manual: true },
  );

  const reFetchMe = () => {
    featchMe();
  };

  useEffect(() => {
    // console.log("userFromLocalStorage>>>", userFromLocalStorage);
    if (!userFromLocalStorage) return;
    setLoadedUser(userFromLocalStorage);
  }, [userFromLocalStorage]);

  useEffect(() => {
    console.log("error>>>", error);
    // console.log("dataMe>>>", dataMe);
    if (!dataMe) return;
    const deserializedData = deserialize<IUser>(dataMe, {
      changeCase: CaseType.camelCase,
    }) as IUser;

    setMeData(deserializedData);
    // console.log("deserialized USER ME>>", deserializedData);
  }, [dataMe, error]);

  const login = (token: string, refreshToken: string, user: IUser) => {
    setUserLocalStorage(user, true);
    setLoadedUser(user);
    setToken(token);
    setAccessTokenToHeaders(token);
    setRefreshToken(refreshToken);
    // if (Platform.OS !== "ios") {
    //   setRollbarClient({
    //     id: user.id,
    //     email: user.email || user.phone,
    //     username: user.username,
    //   });
    // }
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
        meData,
        loadingToken,
        token,
        loadingRefreshToken,
        refreshToken,
        setUser,
        login,
        logout,
        reFetchMe,
        // rollbar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
