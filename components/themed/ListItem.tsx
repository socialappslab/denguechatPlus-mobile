import { TouchableOpacity } from "react-native";
import { ThemeProps } from "@/components/themed/useThemeColor";
import { Text, View } from "@/components/themed";

import ArrowForward from "@/assets/images/icons/arrow-forward.svg";

export type ListItemProps = ThemeProps &
  TouchableOpacity["props"] & {
    size?: number | "small" | "large";
    onPressElement: () => void;
    initials?: string;
    title?: string;
    filled?: string;
    emptyString?: string;
    disabled?: boolean;
    square?: boolean;
    className?: string;
  };

export function ListItem(props: ListItemProps) {
  const {
    onPressElement,
    title,
    square,
    disabled,
    initials,
    emptyString,
    filled,
    className,
  } = props;

  return (
    <TouchableOpacity
      disabled={disabled}
      className={`flex-row items-center px-0 py-4 border-b border-gray-200 `}
      onPress={onPressElement}
    >
      {initials && (
        <View
          className={`flex items-center justify-center w-12 h-12 
         ${square ? "rounded-md" : "rounded-full"}  bg-green-400 mr-3`}
        >
          <Text className="font-bold text-sm text-green-700">{initials}</Text>
        </View>
      )}

      <View className={`flex flex-1 flex-row items-center`}>
        <View className="flex flex-1 flex-col">
          <Text className={`${disabled ? "opacity-60" : ""}`}>{title}</Text>
          {filled && (
            <Text
              className={`text-sm font-thin ${disabled ? "opacity-60" : ""}`}
            >
              {filled}
            </Text>
          )}
          {!filled && emptyString && (
            <Text
              className={`text-sm font-thin opacity-80 ${disabled ? "opacity-40" : ""}`}
            >
              {emptyString}
            </Text>
          )}
        </View>
        <View className="ml-4">
          <ArrowForward />
        </View>
      </View>
    </TouchableOpacity>
  );
}
