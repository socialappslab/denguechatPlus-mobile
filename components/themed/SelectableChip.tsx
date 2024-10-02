import React from "react";
import { TouchableOpacity } from "react-native";

import { Text, View } from "@/components/themed";
import { ThemeProps } from "@/components/themed/useThemeColor";
import CheckGreenSimple from "@/components/icons/CheckGreenSimple";

export type SimpleSelectableChipProps = ThemeProps &
  TouchableOpacity["props"] & {
    label: string;
    checked: boolean;
    onPressElement: () => void;
    disabled?: boolean;
  };

export function SimpleSelectableChip({
  label,
  disabled,
  checked,
  onPressElement,
  ...other
}: SimpleSelectableChipProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      className={`flex-row items-center px-2 py-1 ${checked ? "border-2 border-green-250 bg-green-150" : "border border-gray-200 bg-transparent"} rounded-md`}
      onPress={onPressElement}
      {...other}
    >
      <View className="flex flex-row items-center bg-transparent">
        {checked && (
          <View className="bg-transparent mr-1">
            <CheckGreenSimple />
          </View>
        )}
        <View className="flex flex-col bg-transparent">
          <Text
            className={`text-sm ${disabled ? "opacity-60" : ""} ${checked ? "text-green-900" : ""}`}
          >
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
