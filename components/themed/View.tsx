import { View as DefaultView } from "react-native";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { BottomSheetView } from "@gorhom/bottom-sheet";

export type ViewProps = ThemeProps &
  DefaultView["props"] & { isSheet?: boolean };

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, isSheet, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  if (isSheet) {
    const { children, ...lastProps } = props;
    return (
      <BottomSheetView style={[{ backgroundColor }, style]} {...lastProps}>
        {children}
      </BottomSheetView>
    );
  }

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
