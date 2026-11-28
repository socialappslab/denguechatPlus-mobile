import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import Icon from "@react-native-vector-icons/material-design-icons/static";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RewardMedal } from "@/components/rewards/RewardMedal";
import { RewardProgress } from "@/components/rewards/RewardProgress";
import { useAvatarsQuery, useChangeAvatar } from "@/hooks/useAvatar";
import { useStore } from "@/hooks/useStore";
import { PointAward, RewardLevel } from "@/types";

const green = "#067507";
const ink = "#1C1917";
const gray = "#4D4D54";
const prefix = "visit.final.rewards";
type Kind = "tariki" | "medal" | "skin";
interface Award {
  key: string;
  kind: Kind;
  title: string;
  detail: string;
  level?: RewardLevel;
}

const confettiColors = [
  "#FF8133",
  "#FCC914",
  "#04BF00",
  "#62A9EA",
  "#B45FD6",
  "#F28B82",
  "#4CC3EF",
];
const confetti = Array.from({ length: 22 }, (_, i) => (
  <View
    key={i}
    style={{
      position: "absolute",
      left: `${(i * 37 + 11) % 96}%`,
      top: `${(i * 53 + 7) % 92}%`,
      width: i % 3 === 0 ? 8 : 6,
      height: i % 3 === 0 ? 12 : 6,
      borderRadius: i % 3 === 0 ? 2 : 3,
      transform: [{ rotate: `${(i * 47) % 90}deg` }],
      opacity: 0.85,
      backgroundColor: confettiColors[i % confettiColors.length],
    }}
  />
));

function Badge({
  award,
  size,
  points,
}: {
  award: Award;
  size: 64 | 76 | 150;
  points: number;
}) {
  const { t } = useTranslation();
  if (award.level)
    return (
      <RewardMedal
        level={award.level}
        size={size}
        faceColor={size === 64 ? "#FFFFFF" : undefined}
      />
    );
  const hero = size === 150;
  return (
    <View
      style={[s.circle, { width: size, height: size, backgroundColor: green }]}
    >
      <View
        style={[
          s.circle,
          {
            width: size * 0.79,
            height: size * 0.79,
            backgroundColor: size === 76 ? "#DCFCE3" : "white",
          },
        ]}
      >
        {hero ? (
          <>
            <Text style={[s.bold, { fontSize: 44 }]}>{points}</Text>
            <Text>{t("visit.final.tarikiStatusModal.points")}</Text>
          </>
        ) : (
          <Icon name="home-city" color={green} size={size === 64 ? 26 : 30} />
        )}
      </View>
    </View>
  );
}

function Action({
  title,
  primary,
  onPress,
  avatar,
  disabled,
}: {
  title: string;
  primary?: boolean;
  avatar?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.action,
        primary && s.primary,
        { opacity: disabled ? 0.55 : pressed ? 0.8 : 1 },
      ]}
    >
      {avatar && (
        <Icon name="face-man" size={20} color={primary ? "white" : green} />
      )}
      <Text
        style={[
          s.bold,
          { fontSize: primary ? 16 : 15, color: primary ? "white" : ink },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function RewardRow({ award, points }: { award: Award; points: number }) {
  const { t } = useTranslation();
  const accent = award.level?.colorSecondary ?? green;
  const darkTile = award.level?.colorBackground?.toLowerCase() === "#262626";
  return (
    <View
      style={[
        s.tile,
        {
          backgroundColor: award.level?.colorBackground ?? "#F4FFF4",
          borderColor: award.level ? accent + "55" : "#B7E4BF",
        },
      ]}
    >
      <View style={[s.shadow, { shadowColor: accent }]}>
        <Badge award={award} size={64} points={points} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[s.label, { color: darkTile ? "white" : accent }]}>
          {t(`${prefix}.label.${award.kind}`)}
        </Text>
        <Text
          style={[s.bold, { fontSize: 16, color: darkTile ? "white" : ink }]}
        >
          {award.title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            lineHeight: 16,
            color: darkTile ? "#EEEEEE" : gray,
          }}
        >
          {award.detail}
        </Text>
      </View>
    </View>
  );
}

export function VisitRewardsSheet({
  pointAwards,
  rewards,
  houseCode,
}: {
  pointAwards: PointAward[];
  rewards: RewardLevel[];
  houseCode?: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const sheet = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const user = useStore((state) => state.userProfile);
  const fetchUserProfile = useStore((state) => state.fetchUserProfile);
  const skins = rewards.filter((r) => r.metric === "worked_houses");
  const medals = rewards.filter((r) => r.metric !== "worked_houses");
  const hasRewards = rewards.length > 0;
  const avatars = useAvatarsQuery(skins.length > 0);
  const changeAvatar = useChangeAvatar();
  useEffect(() => {
    sheet.current?.present();
    if (hasRewards) void fetchUserProfile().catch(() => {});
  }, [hasRewards, fetchUserProfile]);

  const profile = user?.userProfile;
  const avatar = avatars.data?.find((item) => item.id === profile?.avatarId);
  const wearables = skins.filter((skin) =>
    avatar?.variants.some((v) => v.rewardLevelId === skin.id),
  );
  const brigadistPoints =
    pointAwards.find((a) => a.recipient === "brigadist")?.amount ?? 0;
  const brigadePoints =
    pointAwards.find((a) => a.recipient === "brigade")?.amount ?? 0;
  const awards: Award[] = [];
  if (pointAwards.length)
    awards.push({
      key: "tariki",
      kind: "tariki",
      title: t(`${prefix}.heading.tariki`),
      detail: t(`${prefix}.pointsSplit`, { brigadistPoints, brigadePoints }),
    });
  for (const level of [...medals, ...skins]) {
    const kind = level.metric === "worked_houses" ? "skin" : "medal";
    awards.push({
      key: String(level.userRewardId),
      kind,
      level,
      title: level.name,
      detail:
        kind === "skin"
          ? t("rewards.skins.unlockedWith", { count: level.threshold })
          : t(`${prefix}.found`, { count: level.threshold }),
    });
  }
  const single = awards.length === 1 ? awards[0] : undefined;
  const track =
    single?.level &&
    user?.rewards?.find((item) =>
      item.levels.some(
        (level) => level.userRewardId === single.level?.userRewardId,
      ),
    );
  const close = () => sheet.current?.dismiss();
  const openProfile = () => {
    close();
    router.dismissTo("/(auth)/(tabs)/profile");
  };
  const equipActions = wearables.map((skin) => {
    const equipped =
      profile?.skinManuallyChosen && profile.wornSkinId === skin.id;
    const label = equipped
      ? t(`${prefix}.equipped`)
      : t(`${prefix}.${single ? "wearNow" : "wearPrize"}`);
    return (
      <Action
        key={skin.id}
        primary={!!single}
        avatar
        disabled={equipped || changeAvatar.isPending}
        title={wearables.length > 1 ? `${label} · ${skin.name}` : label}
        onPress={() => {
          if (avatar)
            changeAvatar.mutate({
              avatarId: avatar.id,
              equippedRewardLevelId: skin.id,
            });
        }}
      />
    );
  });
  const hasPrimaryEquip = single?.kind === "skin" && equipActions.length > 0;
  const where = !skins.length ? "medal" : !medals.length ? "skin" : "both";
  const badgeSize = single ? 150 : 76;
  const overlap =
    awards.length > 1
      ? Math.max(14, (awards.length * 76 - (width - 84)) / (awards.length - 1))
      : 0;
  return (
    <BottomSheetModal
      ref={sheet}
      accessible={false}
      enableDynamicSizing
      maxDynamicContentSize={height * 0.88}
      backgroundStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      handleIndicatorStyle={{
        width: 40,
        height: 5,
        backgroundColor: "#DADADA",
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.45}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 34),
          gap: 16,
        }}
      >
        <View style={s.header}>
          <Text
            accessibilityRole="header"
            style={[s.bold, { flex: 1, fontSize: 20 }]}
          >
            {t(`${prefix}.heading.${single?.kind ?? "multi"}`)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("close")}
            onPress={close}
            hitSlop={6}
            style={s.close}
          >
            <Icon name="close" size={20} color={gray} />
          </Pressable>
        </View>
        <View
          style={[
            s.hero,
            single && { paddingTop: 24, paddingBottom: 20, gap: 10 },
          ]}
        >
          <View
            accessible={false}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          >
            {confetti}
          </View>
          <View style={s.badges}>
            {awards.map((award, i) => (
              <View
                key={award.key}
                style={[
                  s.shadow,
                  {
                    marginLeft: i ? -overlap : 0,
                    shadowColor: award.level?.colorSecondary ?? green,
                  },
                  !single && s.outline,
                ]}
              >
                <Badge
                  award={award}
                  size={badgeSize}
                  points={brigadistPoints}
                />
              </View>
            ))}
          </View>
          {single ? (
            <>
              <Text
                style={[
                  s.label,
                  {
                    marginTop: 6,
                    color: single.level?.colorSecondary ?? green,
                  },
                ]}
              >
                {t(`${prefix}.label.${single.kind}`)}
              </Text>
              <Text style={[s.heroTitle, { fontSize: 24 }]}>
                {single.title}
              </Text>
              <Text style={s.desc}>
                {single.kind === "tariki"
                  ? t("visit.final.tarikiStatusModal.description", {
                      brigadistPoints,
                      brigadePoints,
                    })
                  : single.level?.description || single.detail}
              </Text>
            </>
          ) : (
            <>
              <Text style={[s.heroTitle, { marginTop: 6 }]}>
                {t(`${prefix}.summary`, { count: awards.length })}
              </Text>
              <Text style={[s.desc, { fontSize: 13, lineHeight: 17 }]}>
                {houseCode
                  ? t(`${prefix}.housePraise`, { code: houseCode })
                  : t(`${prefix}.praise`)}
              </Text>
            </>
          )}
        </View>
        {!single && (
          <View style={{ gap: 10 }}>
            {awards.map((award) => (
              <RewardRow
                key={award.key}
                award={award}
                points={brigadistPoints}
              />
            ))}
          </View>
        )}
        {track?.nextLevel && (
          <RewardProgress
            label={t(
              `rewards.${single?.kind === "skin" ? "skins" : "stars"}.toNext`,
              { count: track.nextLevel.remaining, name: track.nextLevel.name },
            )}
            current={track.currentValue}
            goal={track.nextLevel.threshold}
            color={single?.level?.colorSecondary ?? green}
          />
        )}
        {hasRewards && (
          <Pressable
            accessibilityRole="button"
            onPress={openProfile}
            style={s.where}
          >
            <Icon name="account-outline" size={18} color={green} />
            <Text
              style={{
                color: gray,
                fontSize: 13,
                textAlign: "center",
                flexShrink: 1,
              }}
            >
              {t(`${prefix}.where.${where}`)}{" "}
              <Text style={s.bold}>{t(`${prefix}.place.${where}`)}</Text>
            </Text>
          </Pressable>
        )}
        <View style={{ gap: 10 }}>
          {hasPrimaryEquip && equipActions}
          <Action
            primary={!hasPrimaryEquip}
            title={t(`${prefix}.accept.${single?.kind ?? "multi"}`)}
            onPress={close}
          />
          {!hasPrimaryEquip && equipActions}
          {single?.kind === "medal" && (
            <Action title={t(`${prefix}.myMedals`)} onPress={openProfile} />
          )}
          {!!skins.length && avatars.isError && (
            <Action
              title={t("brigadistProfile.avatar.loadError")}
              onPress={() => void avatars.refetch()}
            />
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
const s = StyleSheet.create({
  bold: { fontWeight: "700", color: ink },
  circle: { borderRadius: 999, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F3",
  },
  hero: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "hidden",
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    borderRadius: 999,
    backgroundColor: "white",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 3,
  },
  outline: { outlineWidth: 3, outlineColor: "white" },
  heroTitle: {
    fontWeight: "700",
    fontSize: 22,
    color: ink,
    textAlign: "center",
  },
  desc: { fontSize: 14, lineHeight: 20, color: gray, textAlign: "center" },
  tile: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.66,
    textTransform: "uppercase",
  },
  where: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  action: {
    minHeight: 46,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DADADA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primary: { minHeight: 50, backgroundColor: green, borderColor: green },
});
