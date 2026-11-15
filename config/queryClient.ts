import { QueryClient } from "@tanstack/react-query";

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient#how-it-works
      gcTime: 24 * DAY_IN_MS,
    },
  },
});
