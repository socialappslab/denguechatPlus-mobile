import { AxiosError } from "axios";
import { ErrorResponse } from "../schema";

// Function to extract error information from an Axios error
export function extractAxiosErrorData(error: unknown): ErrorResponse | null {
  if (error !== null && typeof error === "object") {
    if ("isAxiosError" in error && (error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      if (
        axiosError.response &&
        axiosError.response.data &&
        typeof axiosError.response.data === "object" &&
        "errors" in axiosError.response.data
      ) {
        return axiosError.response.data as ErrorResponse;
      }
      return null;
    }
  }
  return null;
}

export const parseId = (v: string) => parseInt(v.match(/\d+/)![0], 10);

export const formatDate = (dateString: string, fallback?: string) => {
  const date = new Date(dateString);

  const locale = Intl.DateTimeFormat().resolvedOptions().locale;

  try {
    const formattedDate = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);

    return `${formattedDate}`;
  } catch {
    return fallback;
  }
};
