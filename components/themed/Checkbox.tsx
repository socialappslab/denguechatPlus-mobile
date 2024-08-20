// Copyright © 2024 650 Industries.
// from expo-checkbox

import { CheckboxProps } from "@/types/CheckboxProps";
import React from "react";
import { StyleSheet, Pressable, Platform } from "react-native";
import CheckboxIcon from "@/assets/images/checkbox.svg";

export function Checkbox({
  color,
  disabled,
  onChange,
  onValueChange,
  style,
  value,
  ...other
}: CheckboxProps) {
  const handleChange = () => {
    onValueChange?.(!value);
  };

  return (
    <Pressable
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
