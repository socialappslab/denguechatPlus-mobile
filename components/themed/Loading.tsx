import { ActivityIndicator, View as DefaultView } from "react-native";
import { ThemeProps } from "@/components/themed/useThemeColor";
import { View } from "@/components/themed";
import Colors from "@/constants/Colors";
export type ViewProps = ThemeProps &
  DefaultView["props"] & {
    size?: number | "small" | "large";
  };

export function Loading(props: ViewProps) {
  const { size } = props;

  return (
    <View className="flex justify-center">
      <ActivityIndicator size={size ?? "small"} color={Colors.dark.primary} />
    </View>
  );
}
