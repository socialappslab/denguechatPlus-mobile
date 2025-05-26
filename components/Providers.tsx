import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { PropsWithChildren } from "react";
import AuthProvider from "@/context/AuthProvider";
import { BrigadeProvider } from "@/context/BrigadeContext";
import { FilterProvider } from "@/context/FilterContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrigadeProvider>
          <FilterProvider>
            <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
          </FilterProvider>
        </BrigadeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
