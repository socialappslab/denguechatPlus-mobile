import ax, { AxiosError, HttpStatusCode } from "axios";
import * as Application from "expo-application";

import { Alert, Linking, Platform } from "react-native";
import i18n from "./i18n";
import invariant from "tiny-invariant";
import useSessionStore from "@/hooks/useSessionStore";
import { configure } from "axios-hooks";
import { logout } from "@/util";

invariant(
  process.env.EXPO_PUBLIC_API_URL,
  "Expected EXPO_PUBLIC_API_URL to be defined",
);

const axios = ax.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    "X-Device-Type": "mobile",
    "X-Client-Device": "mobile",
    "X-App-Version": Application.nativeApplicationVersion,
  },
});

axios.interceptors.request.use(
  (config) => {
    const { session } = useSessionStore.getState();
    if (session) config.headers["X-Authorization"] = `${session.access}`;
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Variable to avoid showing the alert multiple times due to multiple requests
 * responding with 426 status code. Sadly it cannot be colocated in the
 * interceptor itself because it's recreated on each request.
 */
let isAlertAlreadyOpen = false;
axios.interceptors.response.use(undefined, (error) => {
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

axios.interceptors.response.use(undefined, (error) => {
  if (
    error instanceof AxiosError &&
    (error.status === HttpStatusCode.Unauthorized ||
      error.status === HttpStatusCode.Forbidden)
  ) {
    logout();
  }

  return Promise.reject(error);
});

// NOTE: Configure axios-hooks, remove this after migrating all requests to
// TanStack Query
configure({ axios, cache: false });

export { axios };
