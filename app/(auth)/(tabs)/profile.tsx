import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNetInfo } from "@react-native-community/netinfo";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";
import Toast from "react-native-toast-message";

import { AvatarSheet } from "@/components/profile/AvatarSheet";
import { MonthVisitsCard } from "@/components/profile/MonthVisitsCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { RecentActivity } from "@/components/profile/RecentActivity";
import { SkinsSection } from "@/components/profile/SkinsSection";
import { StarsSection } from "@/components/profile/StarsSection";
import { CheckTeam } from "@/components/segments/CheckTeam";
import { ScrollView, View } from "@/components/themed";
import { useMyVisitsQuery } from "@/hooks/useMyVisitsQuery";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useStore } from "@/hooks/useStore";

const Profile = () => {
  const { t } = useTranslation();
  const userProfile = useStore((state) => state.userProfile);
  const fetchUserProfile = useStore((state) => state.fetchUserProfile);
  const { isInternetReachable } = useNetInfo();
  const avatarSheetRef = useRef<BottomSheetModal>(null);
  const myVisits = useMyVisitsQuery();
  useRefreshOnFocus(myVisits.refetch);

  // Avatar changes are online only until the offline layer can queue them.
  const canEditAvatar = isInternetReachable !== false;

  function handleEditAvatar() {
    if (!canEditAvatar) {
      Toast.show({
        type: "warning",
        text1: t("brigadistProfile.avatar.offline"),
      });
      return;
    }
    avatarSheetRef.current?.present();
  }

  async function handleRefresh() {
    // The brigade can change from the web, and offline we keep the cached one.
    await Promise.all([fetchUserProfile().catch(() => {}), myVisits.refetch()]);
  }

  if (!userProfile) return <View />;

  const tracks = userProfile.rewards ?? [];
  const skins = tracks.find((track) => track.metric === "worked_houses");
  const stars = tracks.find((track) => track.metric === "positive_containers");

  return (
    <CheckTeam view="profile">
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} />
        }
      >
        <ProfileHeader
          user={userProfile}
          canEdit={canEditAvatar}
          onEditPress={handleEditAvatar}
        />
        {myVisits.meta && (
          <MonthVisitsCard
            lastMonthCount={
              myVisits.meta.lastMonthCount + myVisits.offlineCount
            }
            previousMonthCount={myVisits.meta.previousMonthCount}
          />
        )}
        {skins && (
          <SkinsSection
            track={skins}
            wornSkinId={userProfile.userProfile?.wornSkinId ?? null}
          />
        )}
        {stars && <StarsSection track={stars} />}
        <RecentActivity
          visits={myVisits.recent}
          isLoading={myVisits.isLoading}
          isError={myVisits.isError}
        />
        <View className="h-10" />
      </ScrollView>
      <AvatarSheet sheetRef={avatarSheetRef} />
    </CheckTeam>
  );
};

export default Profile;
