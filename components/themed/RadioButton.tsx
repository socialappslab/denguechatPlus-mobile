// Copyright © 2024 650 Industries.
// from expo-checkbox

import { CheckboxProps as RadioButtonProps } from "@/types/CheckboxProps";
import React from "react";
import {
  StyleSheet,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import { View } from "@/components/themed/View";
import { Text } from "@/components/themed/Text";

export function RadioButton({
  color,
  disabled,
  onChange,
  onValueChange,
  style,
  value,
  label,
  required = false,
  ...other
}: RadioButtonProps) {
  const handleChange = () => {
    onValueChange?.(!value);
  };

  return (
    <TouchableOpacity
      onPress={handleChange}
      className={`flex flex-row gap-2 p-2 pb-4 mb-5 rounded-md ${value ? "bg-green-400" : "bg-gray-400"}`}
    >
      <Pressable
        {...other}
        disabled={disabled}
        // Announces "checked" status and "checkbox" as the focused element
        accessibilityRole="radio"
        accessibilityState={{ disabled, checked: value }}
        style={[
          styles.root,
          style,
          value && styles.checked,
          !!color && {
            backgroundColor: value ? color : undefined,
            borderColor: color,
          },
          disabled && styles.disabled,
          value && disabled && styles.checkedAndDisabled,
        ]}
        onPress={handleChange}
      >
        {value && <View className="bg-primary w-2 h-2 rounded-full" />}
      </Pressable>
      <Text className="text-sky-400 font-medium text-sm/[17px]">
        {label}
        {required && "*"}
      </Text>
    </TouchableOpacity>
  );
}

const defaultEnabledColor = Platform.select({
  ios: "#067507",
  android: "#067507",
});
const defaultGrayColor = "#657786";
const disabledGrayColor = "#CCD6DD";
const disabledCheckedGrayColor = "#AAB8C2";

const styles = StyleSheet.create({
  root: {
    height: 20,
    width: 20,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: defaultGrayColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: "#EEFFED",
    borderColor: defaultEnabledColor,
  },
  disabled: {
    borderColor: disabledGrayColor,
    backgroundColor: "transparent",
  },
  checkedAndDisabled: {
    backgroundColor: disabledCheckedGrayColor,
    borderColor: disabledCheckedGrayColor,
  },
});
