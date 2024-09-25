import { TextInput as DefaultTextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { FontFamily } from "@/constants/Styles";
import { View } from "@/components/themed";
import Clear from "@/assets/images/icons/clear.svg";
import { useRef } from "react";

export type TextInputProps = ThemeProps &
  DefaultTextInput["props"] & {
    inputRef?: React.RefObject<DefaultTextInput>;
    search?: boolean;
    onClear?: () => void;
  };

export function TextInput(props: TextInputProps) {
  const {
    style,
    lightColor,
    darkColor,
    hasError,
    search,
    inputRef,
    value,
    onClear,
    ...otherProps
  } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const color = useThemeColor({ dark: lightColor, light: darkColor }, "text");
  const inputRefSearch = useRef<DefaultTextInput>(null);

  const clearText = () => {
    if (inputRefSearch.current) {
      inputRefSearch.current.clear();
    }
    if (onClear) {
      onClear();
    }
  };

  if (!search) {
    return (
      <DefaultTextInput
        ref={inputRef}
        value={value}
        style={[
          { backgroundColor, color, fontFamily: FontFamily.regular },
          style,
        ]}
        className={`${hasError ? "border-red-500" : "border-gray-500"} border rounded-lg p-2 h-11`}
        {...otherProps}
      />
    );
  } else {
    return (
      <View
        className={`${hasError ? "border-red-500" : "border-gray-500"} border flex flex-row items-center rounded-lg p-2 h-11`}
      >
        <Feather name="search" size={20} color="gray" />
        <DefaultTextInput
          ref={inputRefSearch}
          value={value}
          style={[
            {
              backgroundColor,
              color,
              marginLeft: 4,
              fontFamily: FontFamily.regular,
            },
            style,
          ]}
          {...otherProps}
        />
        {value && (
          <TouchableOpacity onPress={clearText}>
            <Clear />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
