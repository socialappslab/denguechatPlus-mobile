import { AxiosError } from "axios";

import moment from "moment";
import "moment/locale/es"; // Import Spanish locale
import "moment/locale/en-gb"; // Import English locale
import "moment/locale/pt"; // Import Portuguese locale

import { ErrorResponse } from "@/schema";
import { FilterData } from "@/context/BrigadeContext";

export * from "./inspection";
export * from "./prepareFormData";

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

export const formatDate = (
  dateString: string,
  language: string | null,
  fallback?: string,
) => {
  try {
    const date = moment(dateString);
    if (language) {
      const localeCode = language.split("-")[0];
      try {
        date.locale(localeCode ?? "es");
      } catch {
        console.error("error setting locale");
      }
    }

    const formattedDate = date.format("YYYY-MMM-DD");
    const capitalizedDate = formattedDate.replace(
      /-(\w)/,
      (match, p1) => `-${p1.toUpperCase()}`,
    );
    return capitalizedDate;
  } catch {
    return fallback;
  }
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function formatDatePosts(
  timestamp: number | string,
  language: string | null,
): string {
  const date = moment(timestamp);
  if (language) {
    const localeCode = language.split("-")[0];
    try {
      date.locale(localeCode ?? "es");
    } catch {
      console.error("error setting locale");
    }
  }

  const now = moment();

  if (now.isSame(date, "day")) {
    return date.fromNow();
  } else if (now.isSame(date, "year")) {
    return capitalizeFirstLetter(date.format("MMM D"));
  } else {
    return capitalizeFirstLetter(date.format("MMM D, YYYY"));
  }
}

export const getInitialsBase = (firstName: string, lastName: string) => {
  const firstInitial =
    firstName.length > 1 ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial =
    lastName.length > 1 ? lastName.charAt(0).toUpperCase() : "";
  return `${firstInitial}${lastInitial}`;
};

export const getInitials = (fullName: string) => {
  const [firstName = "", lastName = ""] = fullName.split(" ");
  return getInitialsBase(firstName, lastName);
};

export const countSetFilters = (
  filters: FilterData,
  keys?: (keyof FilterData)[],
): number => {
  return (Object.keys(filters) as (keyof FilterData)[]).reduce((count, key) => {
    if (filters[key] && (!keys || keys.includes(key))) {
      count += 1;
    }
    return count;
  }, 0);
};

export const getLanguageCode = (language: string | null): string => {
  if (!language) return "es";
  return language.split("-")[0];
};
