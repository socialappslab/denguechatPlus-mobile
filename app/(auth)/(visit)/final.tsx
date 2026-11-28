import { ScrollView } from "react-native";
import FinalIllustration from "@/assets/images/final.svg";
import { Button, SafeAreaView, Text, View } from "@/components/themed";
import { VisitRewardsSheet } from "@/components/VisitRewardsSheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { RewardLevel, PointAward } from "@/types";

function parsePointAwards(value: string | string[] | undefined): PointAward[] {
  const serializedAwards = Array.isArray(value) ? value[0] : value;
  if (!serializedAwards) return [];

  try {
    const awards: unknown = JSON.parse(serializedAwards);
    if (!Array.isArray(awards)) return [];

    return awards.filter((award): award is PointAward => {
      if (!award || typeof award !== "object") return false;

      const candidate = award as Partial<PointAward>;
      return (
        (candidate.recipient === "brigadist" ||
          candidate.recipient === "brigade") &&
        typeof candidate.amount === "number" &&
        candidate.reason === "tariki_reached"
      );
    });
  } catch {
    return [];
  }
}

export default function Final() {
  const router = useRouter();

  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const pointAwards = parsePointAwards(params.pointAwards);

  const offline = params.offline === "true";
  let rewards: RewardLevel[] = [];
  try {
    const parsed = JSON.parse(String(params.earnedRewards ?? "[]"));
    if (!offline && Array.isArray(parsed))
      rewards = parsed.filter((reward) => reward?.userRewardId && reward?.name);
  } catch {
    /* Invalid navigation payload contains no rewards. */
  }
  const prefix = offline ? "offline" : "online";
  return (
    <SafeAreaView edges={["right", "bottom", "left"]}>
      <View className="h-full p-6 justify-between items-center">
        {/* This View is used for space between */}
        <View />
        <ScrollView
          style={{ flex: 1, alignSelf: "stretch" }}
          contentContainerStyle={{ alignItems: "center", paddingVertical: 24 }}
        >
          <View className="justify-center items-center">
            <View className="h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center overflow-hidden">
              <FinalIllustration width="100%" height="100%" />
            </View>
            <View>
              <Text type="title" className="text-center mb-4">
                {t(`visit.final.title`)}
              </Text>
              <Text type="text" className="text-center px-10">
                {t(`visit.final.${prefix}.greetings`)}
              </Text>
            </View>
          </View>
          {offline && (
            <View className="p-4 my-4 rounded-xl bg-green-50">
              <Text className="font-bold">
                {t("visit.final.rewards.pendingTitle")}
              </Text>
              <Text>{t("visit.final.rewards.pendingDescription")}</Text>
            </View>
          )}
        </ScrollView>
        <View className="flex-row gap-2 self-end justify-self-end">
          <View className="flex-1">
            <Button
              primary
              title={t("backToHome")}
              onPress={() => {
                router.dismissAll();
              }}
            />
          </View>
        </View>

        {!offline && (pointAwards.length > 0 || rewards.length > 0) && (
          <VisitRewardsSheet
            houseCode={
              typeof params.houseCode === "string"
                ? params.houseCode
                : undefined
            }
            pointAwards={pointAwards}
            rewards={rewards}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
