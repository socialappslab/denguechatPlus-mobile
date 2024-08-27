import { ActivityIndicator, View as DefaultView } from "react-native";
import { ThemeProps } from "@/components/themed/useThemeColor";
import { View } from "@/components/themed";
import Colors from "@/constants/Colors";
export type ViewProps = ThemeProps & DefaultView["props"];

export function Loading(props: ViewProps) {
  return (
    <View className="flex justify-center">
      <ActivityIndicator size="small" color={Colors.dark.primary} />
    </View>
  );
}
