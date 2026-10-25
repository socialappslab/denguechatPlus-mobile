import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons/static";
import { useTranslation } from "react-i18next";
import { View as RNView } from "react-native";

import { REWARD_TILE_WIDTH, RewardGrid } from "@/components/rewards/RewardGrid";
import { RewardMedal } from "@/components/rewards/RewardMedal";
import { RewardProgress } from "@/components/rewards/RewardProgress";
import { Text, View } from "@/components/themed";
import { RewardTrack } from "@/types";

const PRIMARY = "#067507";
const PROGRESS = "#FF8133";

interface StarsSectionProps {
  track: RewardTrack;
}

export function StarsSection({ track }: StarsSectionProps) {
  const { t } = useTranslation();
  const levels = [...track.levels].sort((a, b) => a.threshold - b.threshold);
  const next = levels.find((level) => level.id === track.nextLevel?.id) ?? null;

  if (levels.length === 0) return null;

  return (
    <View className="mt-6 rounded-2xl border border-neutral-200 p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold">{t("rewards.stars.title")}</Text>
          <Text className="text-xs text-neutral-500">
            {t("rewards.stars.subtitle")}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-3xl font-bold">{track.currentValue}</Text>
          <Text className="text-xs text-neutral-500">
            {t("rewards.stars.unit", { count: track.currentValue })}
          </Text>
        </View>
      </View>

      <View className="mt-4">
        <RewardProgress
          label={
            next
              ? t("rewards.stars.toNext", {
                  count: track.nextLevel!.remaining,
                  name: next.name,
                })
              : t("rewards.stars.allEarned")
          }
          current={track.currentValue}
          goal={next?.threshold ?? null}
          color={PROGRESS}
        />
      </View>

      <RewardGrid rowGap={16}>
        {levels.map((level) => {
          const locked = !level.earned;
          return (
            <View
              key={level.id}
              className="items-center"
              style={{ width: REWARD_TILE_WIDTH }}
            >
              <RNView>
                <RewardMedal level={level} size={72} locked={locked} />
                {locked && (
                  <RNView
                    className="absolute -bottom-0.5 -right-0.5 items-center justify-center rounded-full border-2 border-white bg-neutral-400"
                    style={{ width: 22, height: 22 }}
                  >
                    <MaterialDesignIcons
                      name="lock"
                      size={12}
                      color="#FFFFFF"
                    />
                  </RNView>
                )}
              </RNView>
              <Text
                className="mt-2 text-center text-xs font-bold"
                style={{ color: locked ? "#737373" : "#1C1917" }}
                numberOfLines={2}
              >
                {level.name}
              </Text>
              <Text
                className="text-[11px]"
                style={{ color: locked ? "#737373" : PRIMARY }}
              >
                {locked
                  ? t("rewards.stars.missing", {
                      count: level.threshold - track.currentValue,
                    })
                  : t("rewards.stars.earned")}
              </Text>
            </View>
          );
        })}
      </RewardGrid>
    </View>
  );
}
