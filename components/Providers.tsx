import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { PropsWithChildren } from "react";
import { BrigadeProvider } from "@/context/BrigadeContext";
import { FilterProvider } from "@/context/FilterContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

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
