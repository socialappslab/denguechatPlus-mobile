import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  HttpStatusCode,
} from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { configure, makeUseAxios } from "axios-hooks";
import * as SecureStore from "expo-secure-store";
import * as Application from "expo-application";
import { router } from "expo-router";

import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  REFRESH_TOKEN_LOCAL_STORAGE_KEY,
  USER_LOCAL_STORAGE_KEY,
} from "@/constants/Keys";
import { extractAxiosErrorData } from "@/util";
import { Alert, Linking, Platform } from "react-native";
import i18n from "./i18n";

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
    "X-Device-Type": "mobile",
    "X-Client-Device": "mobile",
    "X-App-Version": Application.nativeApplicationVersion,
  },
};

export const authApi = axios.create(globalConfig);

export async function removeUser() {
  await SecureStore.deleteItemAsync(USER_LOCAL_STORAGE_KEY);
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
}

export async function saveAccessToken(accessToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
}

export const resetAuthApi = () => {
  if (globalConfig.headers) {
    delete globalConfig.headers["X-Authorization"];
  }
  delete authApi.defaults.headers["X-Authorization"];
  void removeUser();
};

export const setAccessTokenToHeaders = (accessToken: string | null) => {
  authApi.defaults.headers["X-Authorization"] = `${accessToken}`;
};

export const setHeaderFromLocalStorage = async () => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
  setAccessTokenToHeaders(token);
};

/**
 * Variable to avoid showing the alert multiple times due to multiple requests
 * responding with 426 status code. Sadly it cannot be colocated in the
 * interceptor itself because it's recreated on each request.
 */
let isAlertAlreadyOpen = false;
function setupUpgradeRequiredInterceptor(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.response.use(undefined, (error) => {
    if (
      error instanceof AxiosError &&
      error.status === HttpStatusCode.UpgradeRequired &&
      !isAlertAlreadyOpen
    ) {
      isAlertAlreadyOpen = true;

      Alert.alert(
        i18n.t("errorCodes.mustUpdateAppTitle"),
        i18n.t("errorCodes.mustUpdateAppDescription"),
        [
          {
            onPress: async () => {
              switch (Platform.OS) {
                case "android":
                  await Linking.openURL(
                    "https://play.google.com/store/apps/details?id=org.denguechatplus",
                  );
                  break;
                case "ios":
                  await Linking.openURL(
                    "https://apps.apple.com/us/app/denguechatplus/id6741427309",
                  );
                  break;
                default:
                  console.error("Platform not supported");
                  break;
              }

              isAlertAlreadyOpen = false;
            },
            text: i18n.t("update"),
          },
        ],
        { cancelable: false },
      );
    }

    return Promise.reject(error);
  });
}

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

export async function getRefreshToken() {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
}

// Function that will be called to refresh authorization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshAuthLogic = async (failedRequest: any) => {
  const refreshToken = await getRefreshToken();
  // console.log("refreshAuthLogic with refresh>>>>>>", refreshToken);
  return publicApi
    .post(
      "/users/session/refresh_token",
      {},
      {
        headers: {
          "X-Refresh-Token": refreshToken,
        },
      },
    )
    .then((refreshResult) => {
      const newToken = refreshResult.data?.meta?.jwt?.res?.access;
      console.log("refreshResult newToken", newToken);

      if (!newToken) {
        return Promise.reject();
      }
      // eslint-disable-next-line no-param-reassign
      failedRequest.response.config.headers["X-Authorization"] = `${newToken}`;
      setAccessTokenToHeaders(newToken);
      saveAccessToken(newToken);
      return Promise.resolve();
    })
    .catch((error) => {
      console.log("error refreshAuthLogic", JSON.stringify(error));
      router.replace("/logout");

      return Promise.reject();
    });
};

createAuthRefreshInterceptor(authApi, refreshAuthLogic, {
  statusCodes: [401],
  shouldRefresh: (error) => {
    const { config } = error;
    if (config?.url?.endsWith("refresh_token")) {
      return false;
    }
    const errorData = extractAxiosErrorData(error);

    console.log(
      "shouldRefresh method url>>>>>>",
      error.response?.status +
        " " +
        error.response?.config?.method +
        " " +
        error.response?.config?.url +
        " " +
        JSON.stringify(error.response?.config?.params),
    );
    if (
      errorData?.errors &&
      `${errorData?.errors[0]?.error_code}` === "expired_token"
    ) {
      return true;
    }

    return false;
  },
  onRetry: (requestConfig) => {
    console.log(
      "onRetry url >>>>>>",
      requestConfig.url + " " + requestConfig?.headers,
    );

    return requestConfig;
  },
  pauseInstanceWhileRefreshing: true,
});

configure({ axios: authApi, cache: false });

setupUpgradeRequiredInterceptor(authApi);
setupUpgradeRequiredInterceptor(publicApi);
