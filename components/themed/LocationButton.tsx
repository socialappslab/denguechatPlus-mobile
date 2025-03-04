import { TouchableOpacity } from "react-native";
import { ThemeProps } from "./useThemeColor";
import { IconMaterial } from "./IconMaterial";
import { Text } from "./Text";
import { View } from "./View";

import Marker from "@/assets/images/icons/marker.svg";

export type LocationButtonProps = ThemeProps &
  TouchableOpacity["props"] & {
    onPressElement: () => void;
    initials?: string;
    label?: string;
    disabled?: boolean;
  };

export function LocationButton(props: LocationButtonProps) {
  const { onPressElement, label, disabled } = props;

  return (
    <TouchableOpacity
      disabled={disabled}
      className="flex-row items-center px-4 py-4"
      onPress={onPressElement}
    >
      <View className="mr-4">
        <Marker />
      </View>

      <View className="flex flex-1 flex-row items-center">
        <View className="flex flex-1 flex-col">
          <Text className={`text-sm ${disabled ? "opacity-60" : ""}`}>
            {label}
          </Text>
        </View>
        <View className="ml-4">
          <IconMaterial size={20} name="chevron-right" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
