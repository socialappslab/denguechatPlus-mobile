import React from "react";
import {
  FieldValues,
  UseControllerProps,
  useController,
} from "react-hook-form";
import {
  PasswordInput as ThemedPasswordInput,
  TextInputProps,
} from "../themed";
import { Text, View } from "react-native";

type Props<T extends FieldValues> = UseControllerProps<T> &
  TextInputProps & { label?: string; required?: boolean; helperText?: string };

export function PasswordInput<T extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  disabled,

  label,
  required,
  helperText,

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

      <ThemedPasswordInput
        hasError={Boolean(error)}
        onChangeText={onChange}
        {...field}
        {...props}
      />

      {helperText && !error && (
        <Text className="text-gray-500 text-xs mt-1">{helperText}</Text>
      )}

      {error && (
        <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
      )}
    </View>
  );
}
