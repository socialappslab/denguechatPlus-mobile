import { TextInput as DefaultTextInput } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { FontFamily } from "@/constants/Styles";
import { View } from "@/components/themed";

export type TextInputProps = ThemeProps &
  DefaultTextInput["props"] & {
    inputRef?: React.RefObject<DefaultTextInput>;
    search?: boolean;
  };

export function TextInput(props: TextInputProps) {
  const {
    style,
    lightColor,
    darkColor,
    hasError,
    search,
    inputRef,
    ...otherProps
  } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const color = useThemeColor({ dark: lightColor, light: darkColor }, "text");

  if (!search) {
    return (
      <DefaultTextInput
        ref={inputRef}
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
        className={`${hasError ? "border-red-500" : "border-gray-500"} border flex-row items-center rounded-lg p-2 h-11`}
      >
        <Feather name="search" size={20} color="gray" />
        <DefaultTextInput
          ref={inputRef}
          style={[
            { backgroundColor, color, fontFamily: FontFamily.regular },
            style,
          ]}
          {...otherProps}
        />
      </View>
    );
  }
}
