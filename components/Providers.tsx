import { DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { PropsWithChildren } from "react";
import { BrigadeProvider } from "@/context/BrigadeContext";
import { FilterProvider } from "@/context/FilterContext";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DAY_IN_MS, queryClient } from "@/config/queryClient";

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export function Providers({ children }: PropsWithChildren) {
  useReactQueryDevTools(queryClient);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: 24 * DAY_IN_MS,
        }}
      >
        <BrigadeProvider>
          <FilterProvider>
            <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
          </FilterProvider>
        </BrigadeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
