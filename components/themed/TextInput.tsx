import { TextInput as DefaultTextInput } from "react-native";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { FontFamily } from "@/constants/Styles";

export type TextInputProps = ThemeProps & DefaultTextInput["props"];

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, hasError, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const color = useThemeColor({ dark: lightColor, light: darkColor }, "text");

  return (
    <DefaultTextInput
      style={[
        { backgroundColor, color, fontFamily: FontFamily.regular },
        style,
      ]}
      className={`${hasError ? "border-red-500" : "border-gray-500"} border rounded-lg h-11`}
      {...otherProps}
    />
  );
}
