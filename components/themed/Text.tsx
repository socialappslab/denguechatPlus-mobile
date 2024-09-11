import { Text as DefaultText } from "react-native";
import { useThemeColor, ThemeProps } from "@/components/themed/useThemeColor";

export type TextProps = ThemeProps &
  DefaultText["props"] & {
    type?: "title" | "header" | "default" | "text" | "small";
  };

type ClassNameMap = Record<NonNullable<TextProps["type"]>, string>;

const classNameMap: ClassNameMap = {
  title: "text-2xl font-bold",
  header: "text-2xl font-semibold",
  text: "text-base font-normal",
  default: "text-md",
  small: "text-sm text-slate-600",
};

export function Text(props: TextProps) {
  const {
    style,
    lightColor,
    darkColor,
    type = "default",
    ...otherProps
  } = props;
  return (
    <DefaultText
      style={[style]}
      {...otherProps}
      className={classNameMap[type]}
    />
  );
}
