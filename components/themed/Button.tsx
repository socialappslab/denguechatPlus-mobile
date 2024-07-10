import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";

interface BaseButtonProps {
  title: string;
}

export type ButtonProps = ThemeProps &
  BaseButtonProps &
  TouchableOpacity["props"];

function Button(props: ButtonProps) {
  const { style, title, disabled, lightColor, darkColor, ...otherProps } =
    props;

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "primary",
  );

  return (
    <TouchableOpacity
      style={[{ backgroundColor }, style]}
      {...otherProps}
      disabled={disabled}
      className={`${disabled ? "opacity-50" : ""} w-full p-3 bg-primary rounded-lg`}
    >
      <Text className="text-white text-center font-bold">{title}</Text>
    </TouchableOpacity>
  );
}

export default Button;
