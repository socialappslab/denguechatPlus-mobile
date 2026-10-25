import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons/static";
import { useTranslation } from "react-i18next";
import { View as RNView } from "react-native";

import { REWARD_TILE_WIDTH, RewardGrid } from "@/components/rewards/RewardGrid";
import { RewardMedal } from "@/components/rewards/RewardMedal";
import { RewardProgress } from "@/components/rewards/RewardProgress";
import { Text, View } from "@/components/themed";
import { RewardLevel, RewardTrack } from "@/types";

const PRIMARY = "#067507";

interface SkinsSectionProps {
  track: RewardTrack;
  wornSkinId: number | null;
}

export function SkinsSection({ track, wornSkinId }: SkinsSectionProps) {
  const { t } = useTranslation();
  const levels = [...track.levels].sort((a, b) => a.threshold - b.threshold);
  const earned = levels.filter((level) => level.earned);
  const featured =
    earned.find((level) => level.id === wornSkinId) ?? earned.at(-1) ?? null;
  const next = levels.find((level) => level.id === track.nextLevel?.id) ?? null;

  if (levels.length === 0) return null;

  return (
    <View className="mt-6 rounded-2xl border border-neutral-200 p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold">{t("rewards.skins.title")}</Text>
          <Text className="text-xs text-neutral-500">
            {t("rewards.skins.subtitle")}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-3xl font-bold">{track.currentValue}</Text>
          <Text className="text-xs text-neutral-500">
            {t("rewards.skins.unit", { count: track.currentValue })}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center rounded-xl bg-neutral-100 p-3">
        <RewardMedal
          level={featured ?? levels[0]}
          size={72}
          locked={!featured}
        />
        <View className="ml-4 flex-1 bg-transparent">
          {featured ? (
            <>
              <Text className="text-[10px] font-bold tracking-widest text-neutral-500">
                {t("rewards.skins.current").toUpperCase()}
              </Text>
              <Text className="text-lg font-bold">{featured.name}</Text>
              <Text className="text-xs text-neutral-600">
                {t("rewards.skins.unlockedWith", { count: featured.threshold })}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-base font-bold">
                {t("rewards.skins.firstTitle")}
              </Text>
              <Text className="text-xs text-neutral-600">
                {t("rewards.skins.firstHint", {
                  count: levels[0].threshold,
                  name: levels[0].name,
                })}
              </Text>
            </>
          )}
        </View>
      </View>

      <View className="mt-4">
        <RewardProgress
          label={
            next
              ? t("rewards.skins.toNext", {
                  count: track.nextLevel!.remaining,
                  name: next.name,
                })
              : t("rewards.skins.allUnlocked")
          }
          current={track.currentValue}
          goal={next?.threshold ?? null}
          color={(next ?? levels.at(-1)!).colorSecondary ?? PRIMARY}
        />
      </View>

      <RewardGrid>
        {levels.map((level) => (
          <SkinTile
            key={level.id}
            level={level}
            worn={level.id === featured?.id}
            remaining={Math.max(level.threshold - track.currentValue, 0)}
          />
        ))}
      </RewardGrid>
    </View>
  );
}

interface SkinTileProps {
  level: RewardLevel;
  worn: boolean;
  remaining: number;
}

function SkinTile({ level, worn, remaining }: SkinTileProps) {
  const { t } = useTranslation();
  const locked = !level.earned;

  return (
    <View
      className="items-center rounded-xl px-1 py-3"
      style={{
        width: REWARD_TILE_WIDTH,
        borderWidth: worn ? 2 : 1,
        borderColor: worn ? (level.colorSecondary ?? PRIMARY) : "#E5E5E5",
      }}
    >
      <RNView>
        <RewardMedal level={level} size={72} locked={locked} />
        {(worn || locked) && (
          <RNView
            className="absolute -bottom-0.5 -right-0.5 items-center justify-center rounded-full border-2 border-white"
            style={{
              width: 22,
              height: 22,
              backgroundColor: locked ? "#A3A3A3" : PRIMARY,
            }}
          >
            <MaterialDesignIcons
              name={locked ? "lock" : "check"}
              size={12}
              color="#FFFFFF"
            />
          </RNView>
        )}
      </RNView>
      <Text
        className="mt-2 text-sm font-bold"
        style={{
          color: locked ? "#A3A3A3" : (level.colorPrimary ?? "#1C1917"),
        }}
        numberOfLines={1}
      >
        {level.name}
      </Text>
      <Text className="text-[11px] text-neutral-500" numberOfLines={1}>
        {locked
          ? t("rewards.skins.housesLeft", { count: remaining })
          : worn
            ? t("rewards.skins.inUse")
            : t("rewards.skins.unlocked")}
      </Text>
    </View>
  );
}
