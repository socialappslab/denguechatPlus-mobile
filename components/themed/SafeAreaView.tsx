import { SafeAreaView as DefaultSafeAreaView } from "react-native";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";

export type SafeAreaViewProps = ThemeProps & DefaultSafeAreaView["props"];

export function SafeAreaView(props: SafeAreaViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return (
    <DefaultSafeAreaView
      style={[{ backgroundColor, flex: 1 }, style]}
      {...otherProps}
    />
  );
}
