import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { PropsWithChildren } from "react";
import { BrigadeProvider } from "@/context/BrigadeContext";
import { FilterProvider } from "@/context/FilterContext";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useReactQueryDevTools } from "@dev-plugins/react-query";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient#how-it-works
      gcTime: 24 * DAY_IN_MS,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export function Providers({ children }: PropsWithChildren) {
  useReactQueryDevTools(queryClient);

  return (
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
  );
}
