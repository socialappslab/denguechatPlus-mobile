import React from "react";
import { TouchableOpacity } from "react-native";

import { Text } from "./Text";
import { View } from "./View";
import CheckGreen from "@/assets/images/icons/check-green.svg";
import { ThemeProps } from "./useThemeColor";

export type SimpleSelectableItemProps = ThemeProps &
  TouchableOpacity["props"] & {
    label: string;
    checked: boolean;
    onPressElement: () => void;
    disabled?: boolean;
  };

export function SimpleSelectableItem({
  label,
  disabled,
  checked,
  onPressElement,
  ...other
}: SimpleSelectableItemProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      className={`flex-row items-center px-4 py-4 ${checked ? "border-2 border-green-200 bg-green-300" : "border border-neutral-200 bg-transparent"} rounded-xl`}
      onPress={onPressElement}
      {...other}
    >
      <View className="flex flex-1 flex-row items-center bg-transparent">
        <View className="flex flex-1 flex-col bg-transparent">
          <Text
            className={`text-sm ${disabled ? "opacity-60" : ""} ${checked ? "text-green-900" : ""}`}
          >
            {label}
          </Text>
        </View>
        <View className="ml-4 bg-transparent">
          {checked && <CheckGreen />}
          {!checked && (
            <View className="ml-4 bg-transparent w-4 h-4 rounded-full border border-neutral-200" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
