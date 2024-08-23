import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";

interface BaseButtonProps {
  title: string;
  primary?: boolean;
}

export type ButtonProps = ThemeProps &
  BaseButtonProps &
  TouchableOpacity["props"];

export function Button(props: ButtonProps) {
  const {
    style,
    title,
    disabled,
    lightColor,
    darkColor,
    primary,
    ...otherProps
  } = props;

  return (
    <TouchableOpacity
      style={style}
      {...otherProps}
      disabled={disabled}
      className={`${disabled ? "opacity-50" : ""} w-full ${primary ? "bg-primary" : "bg-white shadow-sm border-gray"} p-3 rounded-lg`}
      activeOpacity={0.8}
    >
      <Text
        className={`text-center font-bold ${primary ? "text-white" : "text-black"}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default Button;
