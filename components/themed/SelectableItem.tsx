// Copyright © 2024 650 Industries.
// from expo-checkbox

import CheckboxIcon from "@/assets/images/checkbox.svg";
import { Text } from "@/components/themed/Text";
import { View } from "@/components/themed/View";
import { SelectableItemProps } from "@/types/SelectableItemProps";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SimpleChip } from "./SimpleChip";
import { TextInput } from "./TextInput";

// image fallback
// <View className="bg-green-300 h-52 flex-grow mb-4 rounded-xl border-green-300 flex items-center justify-center">
//   <Text className="text-center text">Imagen</Text>
// </View>

export function SelectableItem({
  color,
  disabled,
  onChange,
  onValueChange,
  style,
  checked,
  value,
  label,
  chip,
  image,
  optionType,
  required = false,
  type = "radio",
  defaultText,
  ...other
}: SelectableItemProps) {
  const [text, setText] = useState(defaultText);
  const { t } = useTranslation();

  const onChangeText = (text: string) => {
    if (!onValueChange) return;
    setText(text);
    onValueChange(text);
  };

  const handleChange = () => {
    if (!onValueChange) return;
    // Only pass a value when there's a text
    if (text && optionType) {
      return onValueChange(text);
    }
    onValueChange(null);
  };

  const styles = type === "radio" ? radioStyles : boxStyles;
  const checkedView =
    type === "radio" ? (
      <View className="bg-primary w-2 h-2 rounded-full" />
    ) : (
      <CheckboxIcon />
    );

  return (
    <TouchableOpacity
      onPress={!disabled ? handleChange : () => {}}
      className={`flex p-4 mb-2 rounded-md ${checked ? "bg-green-400" : "bg-gray-400"} ${disabled && "opacity-50"}`}
    >
      <View className="flex bg-transparent">
        {image && (
          <View className="bg-green-300 h-52 flex-grow mb-4 rounded-xl border-green-300 flex items-center justify-center">
            <Image className="w-full h-full" source={{ uri: `${image}.png` }} />
          </View>
        )}
        <View className="flex flex-row bg-transparent">
          <Pressable
            className="mr-2"
            {...other}
            disabled={disabled}
            // Announces "checked" status and "checkbox" as the focused element
            accessibilityRole={type}
            accessibilityState={{ disabled, checked }}
            style={[
              styles.root,
              style,
              disabled && styles.disabled,
              checked && styles.checked,
              !!color && {
                backgroundColor: checked ? color : undefined,
                borderColor: color,
              },
              checked && disabled && styles.checkedAndDisabled,
            ]}
            onPress={handleChange}
          >
            {checked && checkedView}
          </Pressable>
          <Text className="text-sky-400 font-medium text-sm/[17px] flex-grow">
            {label}
            {required && "*"}
          </Text>
        </View>
      </View>
      {checked && optionType === "textArea" && (
        <TextInput
          className="w-full h-32 mt-3 rounded border border-slate-300 text-md p-3"
          multiline
          numberOfLines={4}
          onChangeText={onChangeText}
          value={text}
          placeholder={t("placeholder")}
          keyboardType="default"
        />
      )}
      {checked && optionType === "inputNumber" && (
        <TextInput
          className="w-full mt-3 rounded border border-slate-300 text-md p-3"
          onChangeText={onChangeText}
          value={text}
          placeholder={t("quantity")}
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

const radioStyles = StyleSheet.create({
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

const boxStyles = StyleSheet.create({
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
    opacity: 0.5,
  },
  checkedAndDisabled: {
    backgroundColor: disabledCheckedGrayColor,
    borderColor: disabledCheckedGrayColor,
  },
});
