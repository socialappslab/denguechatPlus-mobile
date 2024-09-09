import { ActivityIndicator, View as DefaultView } from "react-native";
import { ThemeProps } from "@/components/themed/useThemeColor";
import { View } from "@/components/themed";
import Colors from "@/constants/Colors";

export type LoadingProps = ThemeProps &
  DefaultView["props"] & {
    size?: number | "small" | "large";
  };

export function Loading(props: LoadingProps) {
  const { size } = props;

  return (
    <View className="flex justify-center">
      <ActivityIndicator size={size ?? "small"} color={Colors.dark.primary} />
    </View>
  );
}
