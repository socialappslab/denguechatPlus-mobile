import { useEffect, useState } from "react";
import { USER_LOCAL_STORAGE_KEY } from "../constants/Keys";
import { useStorageState } from "./useStorageState";
import { IUser } from "../schema/auth";
import * as SecureStore from "expo-secure-store";
import * as Sentry from "@sentry/react-native";

type UseUserHook = [
  [boolean, IUser | null],
  (value: IUser | null, updateLocalStorage: boolean) => void,
];

export default function useUser(): UseUserHook {
  const [[loading, user], setUserLocalStorage] = useStorageState(
    USER_LOCAL_STORAGE_KEY,
  );
  const [loadedUser, setLoadedUser] = useState<IUser | null>(null);

  useEffect(() => {
    if (!loading && user) {
      try {
        setLoadedUser(JSON.parse(user));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        Sentry.captureException(error);
        setLoadedUser(null);
      }
    }
  }, [loading, user]);

  const setUser = (user: IUser | null, updateLocalStorage: boolean) => {
    setLoadedUser(user);
    if (updateLocalStorage) {
      if (user) {
        setUserLocalStorage(JSON.stringify(user));
      } else {
        SecureStore.deleteItemAsync(USER_LOCAL_STORAGE_KEY);
      }
    }
  };

  return [[loading, loadedUser], setUser];
}
