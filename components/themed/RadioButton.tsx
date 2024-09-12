// Copyright © 2024 650 Industries.
// from expo-checkbox

import { CheckboxProps as RadioButtonProps } from "@/types/CheckboxProps";
import React, { useState } from "react";
import {
  StyleSheet,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import { View } from "@/components/themed/View";
import { Text } from "@/components/themed/Text";
import { SimpleChip } from "./SimpleChip";
import { TextInput } from "./TextInput";
import { useTranslation } from "react-i18next";

export function RadioButton({
  color,
  disabled,
  onChange,
  onValueChange,
  style,
  value,
  label,
  chip,
  image,
  textArea,
  required = false,
  ...other
}: RadioButtonProps) {
  const handleChange = () => {
    onValueChange?.(!value);
  };
  const [text, setText] = useState("");
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={handleChange}
      className={`flex p-4 mb-2 rounded-md ${value ? "bg-green-400" : "bg-gray-400"}`}
    >
      <View className="flex flex-row bg-transparent">
        {image && (
          <View className="bg-green-300 h-52 flex-grow mb-4 rounded-xl border-green-300 flex items-center justify-center">
            <Text className="text-center text">Imagen</Text>
          </View>
        )}
        <Pressable
          className="bg-white mr-2"
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
        <Text className="text-sky-400 font-medium text-sm/[17px] flex-grow">
          {label}
          {required && "*"}
        </Text>
      </View>
      {value && textArea && (
        <TextInput
          className="w-full h-32 mt-3 rounded border border-slate-300 text-md p-3"
          multiline
          numberOfLines={4}
          onChangeText={setText}
          value={text}
          placeholder={t("placeholder")}
          keyboardType="numeric"
        />
      )}
      {chip && (
        <SimpleChip
          backgroundColor="green-300"
          padding="small"
          borderColor="green-400"
          border="1"
          label={chip}
        />
      )}
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
