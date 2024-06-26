import { TextInput as DefaultTextInput } from "react-native";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { FontFamily } from "@/constants/Styles";

export type TextInputProps = ThemeProps & DefaultTextInput["props"];

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
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
      className="border border-gray-500 rounded-lg p-3 h-11"
      {...otherProps}
    />
  );
}
