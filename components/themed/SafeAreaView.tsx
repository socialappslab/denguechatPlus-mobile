import {
  SafeAreaView as DefaultSafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";

export type Props = ThemeProps & SafeAreaViewProps;

export function SafeAreaView(props: Props) {
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
