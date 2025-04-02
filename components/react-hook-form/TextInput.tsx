import React from "react";
import {
  FieldValues,
  UseControllerProps,
  useController,
} from "react-hook-form";
import { TextInput as ThemedTextInput, TextInputProps } from "../themed";
import { Text, View } from "react-native";

type Props<T extends FieldValues> = UseControllerProps<T> &
  TextInputProps & { label?: string; required?: boolean };

export function TextInput<T extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  disabled,

  label,
  required,

  ...props
}: Props<T>) {
  const {
    field: { onChange, ...field },
    fieldState: { error },
  } = useController({
    name,
    rules,
    shouldUnregister,
    defaultValue,
    control,
    disabled,
  });

  return (
    <View>
      {label && (
        <Text className="font-medium text-sm mb-2">
          {label} {required && "*"}
        </Text>
      )}

      <ThemedTextInput
        hasError={Boolean(error)}
        onChangeText={onChange}
        {...field}
        {...props}
      />

      {error?.message && (
        <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
      )}
    </View>
  );
}
TextInput.displayName = "TextInput";
