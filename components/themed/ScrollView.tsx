import { ScrollView as DefaultScrollView } from "react-native";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";

export type ScrollViewProps = ThemeProps & DefaultScrollView["props"];

export function ScrollView(props: ScrollViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return (
    <DefaultScrollView
      contentContainerStyle={[
        { paddingBottom: 30 },
        otherProps.contentContainerStyle,
      ]}
      style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}
