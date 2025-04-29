import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

import { Text, View } from "@/components/themed";
import { ThemeProps } from "@/components/themed/useThemeColor";
import CheckGreenSimple from "@/components/icons/CheckGreenSimple";

interface SimpleSelectableChipProps extends ThemeProps, TouchableOpacityProps {
  label: string;
  checked: boolean;
  onPressElement: () => void;
  disabled?: boolean;
}

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
      className={`flex-row items-center px-2 py-1 ${disabled ? "opacity-10" : ""} ${checked ? "border-2 border-green-250 bg-green-150" : "border border-neutral-200 bg-neutral-50"} rounded-md`}
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
            className={`text-sm ${disabled ? "opacity-40" : ""} ${checked ? "text-green-900" : "text-neutral-700"}`}
          >
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
