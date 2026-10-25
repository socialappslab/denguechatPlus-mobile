import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons/static";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import { UserAvatar } from "@/components/segments/UserAvatar";
import { Text, View } from "@/components/themed";
import { Team } from "@/schema";
import { IUser } from "@/schema/auth";

const AVATAR_SIZE = 132;
const NO_SKIN_RING = "#DCFCE3";

interface ProfileHeaderProps {
  user: IUser;
  canEdit: boolean;
  onEditPress: () => void;
}

export function ProfileHeader({
  user,
  canEdit,
  onEditPress,
}: ProfileHeaderProps) {
  const { t } = useTranslation();
  const profile = user.userProfile;
  const team = profile?.team as Team | undefined;
  // users/me sends role names, not role objects.
  const role = (user.roles as unknown as string[] | undefined)?.[0];
  const wornSkin = user.rewards
    ?.flatMap((track) => track.levels)
    .find((level) => level.id === profile?.wornSkinId);
  const ringColor = wornSkin?.colorSecondary ?? NO_SKIN_RING;
  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`;

  return (
    <View className="items-center">
      <Pressable onPress={onEditPress} className="mb-3">
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: AVATAR_SIZE + 12,
            height: AVATAR_SIZE + 12,
            backgroundColor: ringColor,
          }}
        >
          <View
            className="items-center justify-center rounded-full bg-white"
            style={{ width: AVATAR_SIZE + 8, height: AVATAR_SIZE + 8 }}
          >
            <UserAvatar
              uri={profile?.avatarUrl}
              name={fullName}
              size={AVATAR_SIZE}
            />
          </View>
        </View>
        <View
          className="absolute bottom-1 right-1 items-center justify-center rounded-full border-[3px] border-white"
          style={{
            width: 36,
            height: 36,
            backgroundColor: canEdit ? "#067507" : "#A3A3A3",
          }}
        >
          <MaterialDesignIcons name="pencil" size={18} color="#FFFFFF" />
        </View>
      </Pressable>

      <Text className="text-2xl font-bold">{fullName}</Text>

      {role && (
        <View className="mt-1 rounded-full bg-blue-500 px-2.5 py-0.5">
          <Text className="text-xs font-semibold text-white">
            {t(`brigadistProfile.roles.${role}`, { defaultValue: role })}
          </Text>
        </View>
      )}

      {team?.name && (
        <View className="mt-3 flex-row items-center rounded-full border border-green-200 bg-green-50 px-3 py-1.5">
          <MaterialDesignIcons name="account-group" size={16} color="#067507" />
          <Text className="ml-1.5 text-xs text-neutral-600">
            {t("brigadistProfile.currentBrigade")}
          </Text>
          <Text className="ml-1 text-xs font-bold">{team.name}</Text>
          {!!team.sector_name && (
            <Text className="text-xs text-neutral-500">
              {` · ${team.sector_name}${team.wedge_name ? ` - ${team.wedge_name}` : ""}`}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
