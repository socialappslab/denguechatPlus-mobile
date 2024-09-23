import React from "react";
import Toast from "../components/themed/Toast";
import { ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  success: (internalState) => <Toast {...internalState} type="success" />,
  error: (internalState) => <Toast {...internalState} type="error" />,
  warning: (internalState) => <Toast {...internalState} type="warning" />,
};
