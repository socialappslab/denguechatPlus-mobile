// Copyright © 2024 650 Industries.
// from expo-checkbox

import CheckboxIcon from "@/assets/images/checkbox.svg";
import { Text } from "@/components/themed/Text";
import { CheckboxProps } from "@/types/CheckboxProps";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export function Checkbox({
  color,
  disabled,
  onChange,
  onValueChange,
  style,
  value,
  label,
  required,
  ...other
}: CheckboxProps) {
  const handleChange = () => {
    onValueChange?.(!value);
  };

  return (
    <TouchableOpacity
      className={`flex flex-row items-center p-4 mb-2 rounded-md ${value ? "bg-green-400" : "bg-gray-400"}`}
      onPress={handleChange}
    >
      <Pressable
        className="bg-white mr-2"
        {...other}
        disabled={disabled}
        // Announces "checked" status and "checkbox" as the focused element
        accessibilityRole="checkbox"
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
        {value && <CheckboxIcon />}
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
    borderRadius: 4,
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
