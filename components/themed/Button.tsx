import { ThemeProps } from "@/components/themed/useThemeColor";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface BaseButtonProps {
  title: string;
  primary?: boolean;
  textClassName?: string;
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
    textClassName,
    ...otherProps
  } = props;

  const primaryTextColor = primary ? "text-white" : "text-black";

  return (
    <TouchableOpacity
      style={style}
      {...otherProps}
      disabled={disabled}
      className={`${disabled ? "opacity-50" : ""} w-full border-solid border ${primary ? "bg-primary border-primary" : "bg-white border-neutral-200"} p-3 rounded-lg`}
      activeOpacity={0.8}
    >
      <Text
        className={`text-center font-bold ${!textClassName ? primaryTextColor : textClassName}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default Button;
