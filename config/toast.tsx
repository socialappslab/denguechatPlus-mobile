import React from "react";
import Toast from "../components/themed/Toast";
import { ToastConfig, ToastConfigParams } from "react-native-toast-message";

export type ToastProps = ToastConfigParams<{
  textNode?: React.ReactNode;
}>;

export const toastConfig: ToastConfig = {
  success: (props: ToastProps) => <Toast {...props} type="success" />,
  error: (props: ToastProps) => <Toast {...props} type="error" />,
  warning: (props: ToastProps) => <Toast {...props} type="warning" />,
};
