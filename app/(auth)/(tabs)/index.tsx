import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { CheckTeam } from "@/components/segments/CheckTeam";
import {
  Loading,
  ProgressBar,
  SafeAreaView,
  ScrollView,
  SimpleChip,
  Text,
  View,
} from "@/components/themed";
import Colors from "@/constants/Colors";
import { Team, TEAM_LEADER_ROLE } from "@/schema";
import { AccumulatedPoints, ReportData } from "@/types";
import { calculatePercentage, getInitials } from "@/util";
import { RefreshControl } from "react-native-gesture-handler";
import { useQuery } from "@tanstack/react-query";
import { axios } from "@/config/axios";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useHouseBlockLabel } from "@/hooks/useHouseBlockLabel";
import { useStore } from "@/hooks/useStore";

function useReportQuery({
  teamId = null,
  wedgeId = null,
  sectorId = null,
}: {
  teamId: number | null;
  wedgeId: number | null;
  sectorId: number | null;
}) {
  const params = {
    sort: "name",
    order: "asc",
    filter: {
      team_id: teamId,
      wedge_id: wedgeId,
      sector_id: sectorId,
    },
  };

  return useQuery({
    enabled: !!teamId && !!wedgeId && !!sectorId,
    queryKey: ["houseStatus", params],
    queryFn: async () => {
      // TODO: annotate response
      return (await axios.get(`/reports/house_status`, { params }))
        .data as ReportData;
    },
  });
}

function useBrigadePointsQuery(teamId: number | null) {
  const params = {
    filter: { team_id: teamId },
  };

  return useQuery({
    enabled: !!teamId,
    queryKey: ["brigadePoints", teamId!],
    queryFn: async () => {
      return (await axios.get(`/points/accumulated_points`, { params }))
        .data as AccumulatedPoints;
    },
  });
}

function useTeamQuery(teamId: number | null) {
  return useQuery({
    enabled: !!teamId,
    queryKey: ["teams", teamId!],
    queryFn: async () => {
      // TODO: annotate response
      return (await axios.get(`/teams/${teamId}`)).data.data.attributes as Team;
    },
  });
}

export default function Profile() {
  const { t } = useTranslation();
  const userProfile = useStore((state) => state.userProfile);

  const houseBlockLabel = useHouseBlockLabel(
    // @ts-expect-error type of userProfile is wrong
    userProfile?.userProfile?.houseBlock?.type,
  );

  // @ts-expect-error
  const teamId = userProfile?.userProfile?.team?.id;
  // @ts-expect-error
  const wedgeId = userProfile?.userProfile?.team?.wedge_id;
  // @ts-expect-error
  const sectorId = userProfile?.userProfile?.team?.sector_id;

  const team = useTeamQuery(teamId ?? null);
  const report = useReportQuery({ teamId, wedgeId, sectorId });

  const brigadePoints = useBrigadePointsQuery(teamId ?? null);
  useRefreshOnFocus(brigadePoints.refetch);

  const refetchAll = useCallback(async () => {
    if (teamId && wedgeId && sectorId) await report.refetch();
    if (userProfile) await team.refetch();
    if (teamId) await brigadePoints.refetch();
  }, [teamId, wedgeId, sectorId, report, userProfile, team, brigadePoints]);

  // NOTE: maybe we can generalize this in the future, we have the same thing at `(tabs)/visits.tsx`
  const colorPercentages = useMemo(() => {
    if (!report.data) return [0, 0, 0];

    const { redQuantity, orangeQuantity, greenQuantity } = report.data;

    const total = redQuantity + orangeQuantity + greenQuantity;

    const red = Math.floor(calculatePercentage(redQuantity, total));
    const orange = Math.floor(calculatePercentage(orangeQuantity, total));
    const green = Math.floor(calculatePercentage(greenQuantity, total));

    return [green, orange, red];
  }, [report]);

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={report.isLoading}
            onRefresh={refetchAll}
          />
        }
      >
        <CheckTeam view="profile">
          <View className="flex flex-1">
            {team.isLoading && brigadePoints.isLoading && (
              <View className="flex flex-1 items-center justify-center">
                <Loading />
              </View>
            )}
            {!team.isLoading && !brigadePoints.isLoading && (
              <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                <View className="mb-2">
                  <Text className="text-xl font-bold mb-2">
                    {team.data?.name}
                  </Text>
                  <Text className="font-normal mb-2">
                    {team.data?.sector?.name} - {team.data?.wedge?.name}
                  </Text>
                  {/* @ts-expect-error */}
                  {userProfile?.userProfile?.houseBlock?.name && (
                    <Text className="font-normal mb-4">
                      {houseBlockLabel}: {/* @ts-expect-error */}
                      {userProfile.userProfile.houseBlock.name}
                    </Text>
                  )}
                </View>

                <View className="p-4 mb-4 border border-neutral-200 rounded-lg">
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
                    {t("brigadistProfile.pointsOf")}{" "}
                    {brigadePoints.data?.data?.attributes.name}
                  </Text>

                  <Text className="text-3xl font-semibold">
                    {brigadePoints.data?.data?.attributes.totalPoints ?? 0}
                  </Text>
                </View>

                <View className="p-4 mb-4 border border-neutral-200 rounded-lg">
                  <Text className="text-neutral-600 mb-2">
                    {t("brigade.cards.numberSites")}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-3xl font-semibold">
                      {report.data?.houseQuantity ?? 0}
                    </Text>

                    {!!report.data?.siteVariationPercentage && (
                      <SimpleChip
                        border="1"
                        padding="small"
                        textColor="neutral-500"
                        borderColor="neutral-500"
                        ionIcon={
                          report.data?.siteVariationPercentage > 0
                            ? "arrow-up"
                            : "arrow-down"
                        }
                        iconColor={Colors.light.neutral}
                        label={`${report.data?.siteVariationPercentage}% ${t("brigade.cards.numberThisWeek")}`}
                      />
                    )}
                  </View>

                  <View className="flex flex-col mt-6">
                    <ProgressBar
                      label={t("brigade.sites.green")}
                      progress={colorPercentages[0]}
                      colorClassName="bg-verde-600"
                    />
                    <ProgressBar
                      label={t("brigade.sites.yellow")}
                      progress={colorPercentages[1]}
                      colorClassName="bg-yellow-400"
                    />
                    <ProgressBar
                      label={t("brigade.sites.red")}
                      progress={colorPercentages[2]}
                      colorClassName="bg-red-600"
                    />
                  </View>
                </View>

                <View className="rounded-lg border border-neutral-200 mb-8">
                  <View className="bg-neutral-100 border-b border-neutral-200 rounded-t-lg px-4 py-4">
                    <Text className="text-neutral-600 font-medium">
                      {t("brigade.cards.participants")}
                    </Text>
                  </View>

                  {team.data?.members?.map((member, index) => (
                    <View
                      key={member.id}
                      className={`flex-row items-center p-4 border-neutral-200 ${index === team.data?.members?.length - 1 ? "border-b-0 rounded-b-xl" : "border-b"}`}
                    >
                      <View className="flex items-center justify-center w-10 h-10 rounded-full bg-green-300 mr-3">
                        <Text className="font-bold text-sm text-green-700">
                          {getInitials(member.fullName)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text>{member.fullName}</Text>
                      </View>
                      {member.rol === TEAM_LEADER_ROLE && (
                        <SimpleChip
                          padding="small"
                          textColor="blue-500"
                          border="1"
                          borderColor="blue-400"
                          backgroundColor="blue-50"
                          label={`${t("brigade.teamLeader")}`}
                        />
                      )}
                    </View>
                  ))}
                </View>
                <View className={Platform.OS === "ios" ? "h-6" : "h-14"}></View>
              </ScrollView>
            )}
          </View>
        </CheckTeam>
      </ScrollView>
    </SafeAreaView>
  );
}
