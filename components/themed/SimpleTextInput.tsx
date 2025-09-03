import { TextInput as DefaultTextInput } from "react-native";

import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { FontFamily } from "@/constants/Styles";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

export type SimpleTextInputProps = ThemeProps &
  DefaultTextInput["props"] & {
    inputRef?: React.RefObject<DefaultTextInput | null>;
    isSheet?: boolean;
  };

export function SimpleTextInput(props: SimpleTextInputProps) {
  const {
    style,
    readOnly,
    lightColor,
    darkColor,
    hasError,
    inputRef,
    value,
    isSheet,
    ...otherProps
  } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const color = useThemeColor({ dark: lightColor, light: darkColor }, "text");
  const styleInput = { backgroundColor, color, fontFamily: FontFamily.regular };

  if (isSheet) {
    return (
      <BottomSheetTextInput
        value={value}
        style={[
          styleInput,
          {
            marginLeft: 4,
            display: "flex",
            flex: 1,
          },
          style,
        ]}
        {...otherProps}
      />
    );
  }
  return (
    <DefaultTextInput
      ref={inputRef}
      value={value}
      style={[styleInput, style]}
      className={`${readOnly ? "opacity-60" : ""}`}
      {...otherProps}
    />
  );
}
