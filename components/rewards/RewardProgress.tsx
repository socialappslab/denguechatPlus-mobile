import { Text, View } from "@/components/themed";

interface RewardProgressProps {
  label: string;
  current: number;
  goal: number | null;
  color: string;
}

export function RewardProgress({
  label,
  current,
  goal,
  color,
}: RewardProgressProps) {
  const ratio = goal ? Math.min(current / goal, 1) : 1;

  return (
    <View>
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 text-sm font-semibold mr-3">{label}</Text>
        {goal !== null && (
          <Text className="text-sm text-neutral-500">{`${current} / ${goal}`}</Text>
        )}
      </View>
      <View className="mt-2 h-2.5 overflow-hidden rounded-full bg-neutral-200">
        <View
          className="h-full rounded-full"
          style={{ width: `${ratio * 100}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}
