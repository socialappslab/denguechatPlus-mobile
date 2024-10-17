import { TouchableOpacity } from "react-native";
import { ThemeProps } from "@/components/themed/useThemeColor";
import { Text, View } from "@/components/themed";

import Delete from "@/components/icons/Delete";
import Edit from "@/components/icons/Edit";

export type ActionItemProps = ThemeProps &
  TouchableOpacity["props"] & {
    size?: number | "small" | "large";
    onPressElement: () => void;
    title: string;
    disabled?: boolean;
    type?: "edit" | "delete" | "copy";
    className?: string;
  };

export function ActionItem(props: ActionItemProps) {
  const { onPressElement, title, type, className, disabled } = props;
  let icon = null;
  if (type === "edit") {
    icon = <Edit />;
  } else if (type === "delete") {
    icon = <Delete red />;
  }

  return (
    <TouchableOpacity
      disabled={disabled}
      className={`flex-row items-center px-0 py-5 ${className}`}
      onPress={onPressElement}
    >
      {icon && <View className={`mr-2`}>{icon}</View>}
      <View className={`flex flex-1 flex-row items-center`}>
        <Text
          className={`text-lg ${disabled ? "opacity-60" : ""} ${type === "delete" ? "text-red-700" : ""}`}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
