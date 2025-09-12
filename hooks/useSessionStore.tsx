import { ILoginResponse } from "../schema/auth";
import * as SecureStore from "expo-secure-store";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { create } from "zustand";

// NOTE: Custom storage engine to keep user data securely with expo-secure-store
const storage: StateStorage<void> = {
  getItem: async (name: string) => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

type Session = ILoginResponse["meta"]["jwt"]["res"];

interface SessionState {
  session: Session | null;
  setSession: (session: Session) => void;

  reset: () => void;

  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

/*
 * NOTE: We're creating a separate store for managing session data since we
 * cannot mix expo-secure-store and AsyncStorage as the storage engine.
 */
const useSessionStore = create<SessionState>()(
  persist(
    (set, _get, store) => ({
      session: null,
      setSession: (session) => {
        set({ session });
      },

      reset: () => {
        set(store.getInitialState());
      },

      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "session-store",
      storage: createJSONStorage(() => storage),
      onRehydrateStorage: (state) => () => state.setHasHydrated(true),
    },
  ),
);

export default useSessionStore;
