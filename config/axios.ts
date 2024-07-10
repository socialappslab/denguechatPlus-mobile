import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { configure, makeUseAxios } from "axios-hooks";
import * as SecureStore from "expo-secure-store";

interface RetryConfig extends AxiosRequestConfig {
  retry: number;
  retryDelay: number;
}

export const globalConfig: RetryConfig = {
  retry: 0,
  retryDelay: 1000,
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
};

console.log("globalConfig>>>>", globalConfig);

export const setHeaderFromLocalStorage = () => {
  SecureStore.getItemAsync("token").then((token) => {
    if (token && token !== "undefined" && globalConfig.headers) {
      globalConfig.headers.Authorization = `Bearer ${token}`;
    } else if (globalConfig.headers) {
      globalConfig.headers.Authorization = "";
    }
  });
};

export function removeUser(): void {
  SecureStore.deleteItemAsync("token");
  setHeaderFromLocalStorage();
}

export function saveAccessToken(accessToken: string): void {
  SecureStore.setItemAsync("token", accessToken);
  setHeaderFromLocalStorage();
}

// setHeaderFromLocalStorage(); // set header token from local storage on first load

export const authApi = axios.create(globalConfig);

export const resetAuthApi = () => {
  if (globalConfig.headers) {
    delete globalConfig.headers.Authorization;
  }
  delete authApi.defaults.headers.Authorization;
};

export const setAccessTokenToHeaders = (accessToken: string | null) => {
  if (!accessToken) {
    removeUser();
    return;
  }

  saveAccessToken(accessToken);
  authApi.defaults.headers.Authorization = `Bearer ${accessToken}`;
};

authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;

    if (!config) {
      return Promise.reject(error);
    }

    const delayRetryRequest = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, config.retryDelay || 1000);
    });

    // if (error.request.status === 401) {
    //   const url = document.location.href.replace(document.location.origin, '');

    //   if (!config.retry && url !== '/login') {
    //     document.location.href = '/login';
    //     return Promise.reject(error);
    //   }
    // }

    if (!config.retry) {
      return Promise.reject(error);
    }

    config.retry -= 1;
    return delayRetryRequest.then(() => authApi(config));
  },
);

export const publicApi = axios.create(globalConfig);

export const useAxiosNoAuth = makeUseAxios({
  axios: publicApi,
});

configure({ axios: authApi });
