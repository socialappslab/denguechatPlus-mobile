import type { ComponentProps } from "react";
import type { ColorValue, PressableProps } from "react-native";
import { Platform, Pressable } from "react-native";

import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons/static";

interface HeaderIconButtonProps {
  accessibilityLabel: string;
  color: ColorValue;
  name: ComponentProps<typeof MaterialDesignIcons>["name"];
  onPress: NonNullable<PressableProps["onPress"]>;
}

export function HeaderIconButton({
  accessibilityLabel,
  color,
  name,
  onPress,
}: HeaderIconButtonProps) {
  const isAndroid = Platform.OS === "android";
  const buttonSize = isAndroid ? 48 : 44;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{
        color,
        alpha: 0.12,
        borderless: true,
        radius: buttonSize / 2,
      }}
      style={({ pressed }) => ({
        width: buttonSize,
        height: buttonSize,
        alignItems: "center",
        justifyContent: "center",
        opacity: !isAndroid && pressed ? 0.5 : 1,
      })}
    >
      <MaterialDesignIcons name={name} size={24} color={color} />
    </Pressable>
  );
}
