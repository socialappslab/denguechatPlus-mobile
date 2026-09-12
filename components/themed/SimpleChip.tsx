import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons/static";

import { ThemeProps } from "./useThemeColor";
import { View } from "./View";
import { Text } from "./Text";
import Colors from "@/constants/Colors";

export type SimpleChipProps = ThemeProps & {
  iconMaterial?: React.ComponentProps<typeof MaterialDesignIcons>["name"];
  textColor?: string;
  borderColor?: string;
  iconColor?: string;
  label?: string;
  border?: "none" | "1" | "2" | "3";
  backgroundColor?: string;
  padding?: "small" | "medium" | "large";
};

const getPaddingSize = (padding: string) => {
  switch (padding) {
    case "small":
      return "py-0.5 px-1.5";
    case "medium":
      return "py-1 px-2";
    default:
      return "py-2 px-4";
  }
};

export function SimpleChip(props: SimpleChipProps) {
  const {
    iconMaterial,
    borderColor = "primary",
    textColor = "primary",
    border = "2",
    backgroundColor,
    iconColor,
    label,
    padding = "medium",
  } = props;

  const paddingSize = getPaddingSize(padding);
  const borderClass =
    border === "1"
      ? `border border-${borderColor}`
      : `border-${border} border-${borderColor}`;
  const viewClasName = `flex-row items-center ${borderClass} rounded-md ${paddingSize} bg-${backgroundColor}`;

  return (
    <View className={viewClasName}>
      {iconMaterial && (
        <View className="w-4 h-4 mr-2">
          <MaterialDesignIcons
            name={iconMaterial}
            size={16}
            color={iconColor ?? Colors.light.primary}
          />
        </View>
      )}
      <Text
        className={`text-${padding === "small" ? "xs" : "sm"} text-${textColor}`}
      >
        {label}
      </Text>
    </View>
  );
}
