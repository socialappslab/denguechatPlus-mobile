import { CheckTeam } from "@/components/segments/CheckTeam";
import {
  View,
  Text,
  ScrollView,
  SimpleChip,
  ProgressBar,
} from "@/components/themed";
import { authApi } from "@/config/axios";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthProvider";
import { AccumulatedPoints } from "@/types";
import { calculatePercentage, getInitialsBase } from "@/util";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";

function useReportQuery({
  teamId = null,
  wedgeId = null,
  sectorId = null,
}: {
  teamId: number | null;
  wedgeId: number | null;
  sectorId: number | null;
}) {
  return useQuery({
    enabled: !!teamId && !!wedgeId && !!sectorId,
    queryKey: ["report", { teamId, wedgeId, sectorId }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort: "name",
        order: "asc",
        "filter[team_id]": teamId!.toString(),
        "filter[wedge_id]": wedgeId!.toString(),
        "filter[sector_id]": sectorId!.toString(),
      });
      return (await authApi.get(`/reports/house_status?${params}`)).data;
    },
  });
}

function useBrigadistPointsQuery(userId: number | null) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["brigadistPoints", userId!],
    queryFn: async () => {
      const params = new URLSearchParams({
        "filter[user_account_id]": userId!.toString(),
      });
      return (await authApi.get(`/points/accumulated_points?${params}`))
        .data as AccumulatedPoints;
    },
  });
}

function useBrigadePointsQuery(teamId: number | null) {
  return useQuery({
    enabled: !!teamId,
    queryKey: ["brigadePoints", teamId!],
    queryFn: async () => {
      const params = new URLSearchParams({
        "filter[team_id]": teamId!.toString(),
      });
      return (await authApi.get(`/points/accumulated_points?${params}`))
        .data as AccumulatedPoints;
    },
  });
}

const Profile = () => {
  const { t } = useTranslation();
  const { meData } = useAuth();

  // @ts-expect-error type of meData is not correct
  const teamId = meData?.userProfile?.team?.id;
  // @ts-expect-error type of meData is not correct
  const sectorId = meData?.userProfile?.team?.sector_id;
  // @ts-expect-error type of meData is not correct
  const wedgeId = meData?.userProfile?.team?.wedge_id;
  // @ts-expect-error type of meData is not correct
  const userId = meData?.userProfile?.id;

  const reportParams = useMemo(
    () => ({ teamId, sectorId, wedgeId }),
    [teamId, sectorId, wedgeId],
  );

  const report = useReportQuery(reportParams);
  const brigadistPoints = useBrigadistPointsQuery(userId ?? null);
  const brigadePoints = useBrigadePointsQuery(teamId ?? null);

  const isLoading =
    !meData ||
    report.isLoading ||
    brigadistPoints.isLoading ||
    brigadePoints.isLoading;

  const brigadistPointsPercentage = useMemo(() => {
    if (!brigadistPoints.data || !brigadePoints.data) return 0;

    const percentage = calculatePercentage(
      // @ts-expect-error remove ! when the backend fixes data being T | null
      brigadistPoints.data.data.attributes.totalPoints,
      // @ts-expect-error remove ! when the backend fixes data being T | null
      brigadePoints.data.data.attributes.totalPoints,
    );

    return Math.round(percentage);
  }, [brigadistPoints, brigadePoints]);

  async function handleRefresh() {
    return await Promise.all([
      report.refetch(),
      brigadistPoints.refetch(),
      brigadePoints.refetch(),
    ]);
  }

  if (isLoading) return <View />;

  return (
    <CheckTeam view="profile">
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={async () => {
              await handleRefresh();
            }}
          />
        }
      >
        <View className="items-center">
          <View className="flex items-center justify-center w-24 h-24 rounded-full bg-green-300 mr-3">
            <Text className="font-bold text-3xl text-green-700">
              {getInitialsBase(
                // @ts-expect-error type of meData is not correct
                meData?.userProfile.firstName,
                // @ts-expect-error type of meData is not correct
                meData?.userProfile.lastName,
              )}
            </Text>
          </View>

          <Text className="text-2xl font-bold mt-4">
            {meData?.userProfile?.firstName} {meData?.userProfile?.lastName}
          </Text>
          <Text className="text-base text-gray-800">
            {/* @ts-expect-error type of meData is not correct */}
            {meData?.userProfile?.team?.name}
          </Text>
        </View>

        <View className="p-4 mb-4 border border-neutral-200 rounded-lg mt-6">
          <Text className="text-neutral-600 mb-2">
            {t("brigade.cards.numberVisits")}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-semibold">
              {report.data?.visitQuantity ?? 0}
            </Text>
            {!!report.data?.visitVariationPercentage && (
              <SimpleChip
                border="1"
                padding="small"
                textColor="neutral-500"
                borderColor="neutral-500"
                ionIcon={
                  report.data?.visitVariationPercentage > 0
                    ? "arrow-up"
                    : "arrow-down"
                }
                iconColor={Colors.light.neutral}
                label={`${report.data?.visitVariationPercentage}% ${t("brigade.cards.numberThisWeek")}`}
              />
            )}
          </View>
        </View>

        <View className="p-4 mb-4 border border-neutral-200 rounded-lg">
          <Text className="text-neutral-600 mb-2">
            {t("brigadistProfile.myPoints")}
          </Text>

          <Text className="text-3xl font-semibold">
            {brigadistPoints.data?.data?.attributes.totalPoints ?? 0}
          </Text>

          <View className="flex flex-col mt-6">
            <ProgressBar
              label={t("brigadistProfile.myContributionInPoints")}
              progress={brigadistPointsPercentage}
              colorClassName="bg-blue-500"
            />
          </View>
        </View>

        <View className="p-4 mb-4 border border-neutral-200 rounded-lg">
          <Text className="text-neutral-600 mb-2">
            {/* TODO: remove `data?.atrributes` when the backend fixes data being T | null */}
            {t("brigadistProfile.pointsOf")}{" "}
            {brigadePoints.data?.data?.attributes.name}
          </Text>

          <Text className="text-3xl font-semibold">
            {/* TODO: remove `data?.atrributes` when the backend fixes data being T | null */}
            {brigadePoints.data?.data?.attributes.totalPoints ?? 0}
          </Text>
        </View>
      </ScrollView>
    </CheckTeam>
  );
};

export default Profile;
