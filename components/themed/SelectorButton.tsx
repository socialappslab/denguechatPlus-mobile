import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native";

import { ThemeProps } from "@/components/themed/useThemeColor";
import { Text, IconMaterial } from "@/components/themed";

export type SelectorButtonProps = ThemeProps &
  TouchableOpacity["props"] & {
    iconMaterial?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    label?: string;
    onPressElement?: () => void;
  };

export function SelectorButton(props: SelectorButtonProps) {
  const { iconMaterial, label, onPressElement, ...other } = props;

  return (
    <TouchableOpacity
      onPress={onPressElement}
      className="flex flex-row items-center rounded-lg border border-neutral-300 bg-transparent pl-2 pr-1 py-2"
      {...other}
    >
      {iconMaterial && <IconMaterial size={20} name={iconMaterial} />}
      <Text className="mr-1 ml-2 text-xs font-medium text-neutral-700">
        {label}
      </Text>
      <IconMaterial size={20} name="chevron-down" />
    </TouchableOpacity>
  );
}