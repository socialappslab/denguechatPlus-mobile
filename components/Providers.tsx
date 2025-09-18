import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { PropsWithChildren } from "react";
import { BrigadeProvider } from "@/context/BrigadeContext";
import { FilterProvider } from "@/context/FilterContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  useReactQueryDevTools(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <BrigadeProvider>
        <FilterProvider>
          <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
        </FilterProvider>
      </BrigadeProvider>
    </QueryClientProvider>
  );
}
