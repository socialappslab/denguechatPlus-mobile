import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons/static";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { CaseType, deserialize } from "jsonapi-fractal";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View as RNView } from "react-native";
import Toast from "react-native-toast-message";

import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import { Text, View } from "@/components/themed";
import { axios } from "@/config/axios";
import { useStore } from "@/hooks/useStore";
import { AvatarOption, RewardLevel, RewardTrack } from "@/types";

const PRIMARY = "#067507";

export function useAvatarsQuery() {
  return useQuery({
    queryKey: ["avatars"],
    queryFn: async () => {
      const response = await axios.get("/avatars");
      return deserialize<AvatarOption[]>(response.data, {
        changeCase: CaseType.camelCase,
      }) as AvatarOption[];
    },
  });
}

interface ChangeAvatarPayload {
  avatarId: number;
  equippedRewardLevelId?: number | null;
}

interface Skin {
  level: RewardLevel;
  remaining: number;
}

// Skins are the reward levels that have a dressed variant of the avatars.
function skinsFrom(avatars: AvatarOption[], rewards: RewardTrack[]): Skin[] {
  const wearable = new Set(
    avatars.flatMap((avatar) => avatar.variants.map((v) => v.rewardLevelId)),
  );
  return rewards
    .flatMap((track) =>
      track.levels
        .filter((level) => wearable.has(level.id))
        .map((level) => ({
          level,
          remaining: Math.max(level.threshold - track.currentValue, 0),
        })),
    )
    .sort((a, b) => a.level.threshold - b.level.threshold);
}

function imageFor(avatar: AvatarOption | undefined, skinId: number | null) {
  if (!avatar) return null;
  if (skinId === null) return avatar.imageUrl;
  return (
    avatar.variants.find((v) => v.rewardLevelId === skinId)?.imageUrl ??
    avatar.imageUrl
  );
}

interface AvatarSheetProps {
  sheetRef: React.RefObject<BottomSheetModal | null>;
}

export function AvatarSheet({ sheetRef }: AvatarSheetProps) {
  const { t } = useTranslation();
  const user = useStore((state) => state.userProfile);
  const fetchUserProfile = useStore((state) => state.fetchUserProfile);
  const avatars = useAvatarsQuery();
  const queryClient = useQueryClient();

  const profile = user?.userProfile;
  const [pending, setPending] = useState<ChangeAvatarPayload | null>(null);

  const changeAvatar = useMutation({
    mutationFn: (payload: ChangeAvatarPayload) =>
      axios.put("/users/change_avatar", payload),
    onMutate: (payload) => setPending(payload),
    onSuccess: async () => {
      await fetchUserProfile();
      // My Brigade lists members with their avatars.
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () =>
      Toast.show({ type: "error", text1: t("brigadistProfile.avatar.error") }),
    onSettled: () => setPending(null),
  });

  const catalog = avatars.data ?? [];
  const avatarId = pending?.avatarId ?? profile?.avatarId ?? catalog[0]?.id;
  const skinId =
    pending && "equippedRewardLevelId" in pending
      ? (pending.equippedRewardLevelId ?? null)
      : (profile?.wornSkinId ?? null);
  const selected = catalog.find((avatar) => avatar.id === avatarId);
  const skins = skinsFrom(catalog, user?.rewards ?? []);

  function chooseAvatar(id: number) {
    if (id === profile?.avatarId) return;
    changeAvatar.mutate({ avatarId: id });
  }

  function chooseSkin(id: number | null) {
    if (avatarId === undefined || (id === skinId && profile?.avatarId)) return;
    changeAvatar.mutate({ avatarId, equippedRewardLevelId: id });
  }

  return (
    <ClosableBottomSheet
      bottomSheetModalRef={sheetRef}
      title={t("brigadistProfile.avatar.title")}
      snapPoints={["85%"]}
    >
      <BottomSheetScrollView style={{ flex: 1, alignSelf: "stretch" }}>
        <View className="px-5 pb-6">
          {avatars.isLoading ? (
            <ActivityIndicator className="my-10" color={PRIMARY} />
          ) : avatars.isError ? (
            <Text className="text-center text-neutral-500 my-10">
              {t("brigadistProfile.avatar.loadError")}
            </Text>
          ) : (
            <>
              <View className="items-center my-3">
                <View
                  className="rounded-full items-center justify-center"
                  style={{
                    width: 120,
                    height: 120,
                    backgroundColor: "#F3F3F3",
                  }}
                >
                  <Image
                    source={{ uri: imageFor(selected, skinId) ?? undefined }}
                    style={{ width: 112, height: 112, borderRadius: 56 }}
                  />
                </View>
                {changeAvatar.isPending && (
                  <ActivityIndicator className="mt-2" color={PRIMARY} />
                )}
              </View>

              <Text
                className="font-semibold text-base"
                style={{ marginBottom: 12 }}
              >
                {t("brigadistProfile.avatar.avatar")}
              </Text>
              <View className="flex-row" style={{ gap: 8, marginBottom: 24 }}>
                {catalog.map((avatar, index) => (
                  <OptionTile
                    key={avatar.id}
                    imageUrl={imageFor(avatar, skinId)}
                    label={t("brigadistProfile.avatar.avatarN", {
                      number: index + 1,
                    })}
                    state={
                      avatar.id === avatarId
                        ? t("brigadistProfile.avatar.chosen")
                        : t("brigadistProfile.avatar.choose")
                    }
                    selected={avatar.id === avatarId}
                    disabled={changeAvatar.isPending}
                    onPress={() => chooseAvatar(avatar.id)}
                  />
                ))}
              </View>

              <Text
                className="font-semibold text-base"
                style={{ marginBottom: 4 }}
              >
                {t("brigadistProfile.avatar.prize")}
              </Text>
              <Text
                className="text-sm text-neutral-500"
                style={{ marginBottom: 12 }}
              >
                {t("brigadistProfile.avatar.prizeHint")}
              </Text>
              <View className="flex-row" style={{ gap: 8 }}>
                <OptionTile
                  imageUrl={imageFor(selected, null)}
                  label={t("brigadistProfile.avatar.noPrize")}
                  state={
                    skinId === null
                      ? t("brigadistProfile.avatar.worn")
                      : t("brigadistProfile.avatar.wear")
                  }
                  selected={skinId === null}
                  disabled={changeAvatar.isPending}
                  onPress={() => chooseSkin(null)}
                />
                {skins.map(({ level, remaining }) => (
                  <OptionTile
                    key={level.id}
                    imageUrl={imageFor(selected, level.id)}
                    label={level.name}
                    state={
                      !level.earned
                        ? t("brigadistProfile.avatar.housesLeft", {
                            count: remaining,
                          })
                        : level.id === skinId
                          ? t("brigadistProfile.avatar.worn")
                          : t("brigadistProfile.avatar.wear")
                    }
                    selected={level.id === skinId}
                    locked={!level.earned}
                    disabled={changeAvatar.isPending}
                    onPress={() => chooseSkin(level.id)}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </BottomSheetScrollView>
    </ClosableBottomSheet>
  );
}

interface OptionTileProps {
  imageUrl: string | null;
  label: string;
  state: string;
  selected: boolean;
  locked?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

function OptionTile({
  imageUrl,
  label,
  state,
  selected,
  locked = false,
  disabled = false,
  onPress,
}: OptionTileProps) {
  return (
    <Pressable
      className="flex-1 items-center rounded-xl py-2 px-1"
      style={{
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? PRIMARY : "#E5E5E5",
        backgroundColor: selected ? "#F4FFF4" : "#FFFFFF",
        opacity: locked ? 0.55 : 1,
      }}
      disabled={locked || disabled}
      onPress={onPress}
    >
      <RNView>
        <Image
          source={{ uri: imageUrl ?? undefined }}
          style={{ width: 52, height: 52, borderRadius: 26 }}
        />
        {locked && (
          <RNView className="absolute -bottom-1 -right-1 rounded-full bg-neutral-400 p-0.5">
            <MaterialDesignIcons name="lock" size={12} color="#FFFFFF" />
          </RNView>
        )}
      </RNView>
      <Text className="text-xs font-semibold mt-1" numberOfLines={1}>
        {label}
      </Text>
      <Text
        className="text-[10px]"
        style={{ color: selected ? PRIMARY : "#737373", textAlign: "center" }}
        numberOfLines={2}
      >
        {state}
      </Text>
    </Pressable>
  );
}
