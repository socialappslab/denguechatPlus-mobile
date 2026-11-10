import { Children, PropsWithChildren } from "react";
import { View } from "react-native";

const COLUMNS = 3;
export const REWARD_TILE_WIDTH = "31.5%";

// Rows of three tiles; the last row is padded so it stays left aligned.
export function RewardGrid({
  children,
  rowGap = 8,
}: PropsWithChildren<{ rowGap?: number }>) {
  const count = Children.count(children);
  const fillers = (COLUMNS - (count % COLUMNS)) % COLUMNS;

  return (
    <View
      className="flex-row flex-wrap justify-between"
      style={{ marginTop: 16, rowGap }}
    >
      {children}
      {Array.from({ length: fillers }, (_, index) => (
        <View key={`filler-${index}`} style={{ width: REWARD_TILE_WIDTH }} />
      ))}
    </View>
  );
}
