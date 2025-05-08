import { useIsFocused } from "@react-navigation/native";
import useAxios from "axios-hooks";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/context/AuthProvider";
import { BaseObject, ErrorResponse, Team, TEAM_LEADER_ROLE } from "@/schema";
import { AccumulatedPoints, ReportData } from "@/types";
import { calculatePercentage, getInitials } from "@/util";
import { RefreshControl } from "react-native-gesture-handler";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/config/axios";

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

export default function Profile() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { meData, reFetchMe } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (isFocused) reFetchMe();
  }, [isFocused, reFetchMe]);

  const [{ data: teamData, loading: loadingTeam }, refetchTeam] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >({
    url: `teams/${(meData?.userProfile?.team as BaseObject)?.id}`,
  });

  const teamId = team?.id;
  // @ts-expect-error
  const wedgeId = meData?.userProfile?.team?.wedge_id;
  // @ts-expect-error
  const sectorId = meData?.userProfile?.team?.sector_id;

  const brigadePoints = useBrigadePointsQuery(teamId ?? null);

  const [{ data: reportData, loading: loadingReport }, refetchReport] =
    useAxios<ReportData, unknown, ErrorResponse>({
      url: `reports/house_status?sort=name&order=asc&filter[team_id]=${teamId}&filter[wedge_id]=${wedgeId}&filter[sector_id]=${sectorId}`,
    });

  useEffect(() => {
    if (meData) refetchTeam();
  }, [meData, refetchTeam]);

  useEffect(() => {
    if (!teamData) return;
    const deserializedData = deserialize<Team>(teamData);
    if (deserializedData && !Array.isArray(deserializedData)) {
      setTeam(deserializedData);
    }
  }, [teamData]);

  // NOTE: maybe we can generalize this in the future, we have the same thing at `(tabs)/visits.tsx`
  const colorPercentages = useMemo(() => {
    if (!reportData) return [0, 0, 0];

    const { redQuantity, orangeQuantity, greenQuantity } = reportData;

    const total = redQuantity + orangeQuantity + greenQuantity;

    const red = Math.floor(calculatePercentage(redQuantity, total));
    const orange = Math.floor(calculatePercentage(orangeQuantity, total));
    const green = Math.floor(calculatePercentage(greenQuantity, total));

    return [green, orange, red];
  }, [reportData]);

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loadingReport}
            onRefresh={refetchReport}
          />
        }
      >
        <CheckTeam view="profile">
          <View className="flex flex-1">
            {loadingTeam && brigadePoints.isLoading && (
              <View className="flex flex-1 items-center justify-center">
                <Loading />
              </View>
            )}
            {!loadingTeam && !brigadePoints.isLoading && (
              <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                <View className="mb-2">
                  <Text className="text-xl font-bold mb-2">{team?.name}</Text>
                  <Text className="font-normal mb-2">
                    {team?.sector?.name} - {team?.wedge?.name}
                  </Text>
                  {/* @ts-expect-error */}
                  {meData?.userProfile?.houseBlock?.name && (
                    <Text className="font-normal mb-4">
                      {/* @ts-expect-error */}
                      Frente a Frente: {meData.userProfile.houseBlock.name}
                    </Text>
                  )}
                </View>

                <View className="p-4 mb-4 border border-neutral-200 rounded-lg">
                  <Text className="text-neutral-600 mb-2">
                    {t("brigade.cards.numberVisits")}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-3xl font-semibold">
                      {reportData?.visitQuantity ?? 0}
                    </Text>
                    {!!reportData?.visitVariationPercentage && (
                      <SimpleChip
                        border="1"
                        padding="small"
                        textColor="neutral-500"
                        borderColor="neutral-500"
                        ionIcon={
                          reportData?.visitVariationPercentage > 0
                            ? "arrow-up"
                            : "arrow-down"
                        }
                        iconColor={Colors.light.neutral}
                        label={`${reportData?.visitVariationPercentage}% ${t("brigade.cards.numberThisWeek")}`}
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
                      {reportData?.houseQuantity ?? 0}
                    </Text>

                    {!!reportData?.siteVariationPercentage && (
                      <SimpleChip
                        border="1"
                        padding="small"
                        textColor="neutral-500"
                        borderColor="neutral-500"
                        ionIcon={
                          reportData?.siteVariationPercentage > 0
                            ? "arrow-up"
                            : "arrow-down"
                        }
                        iconColor={Colors.light.neutral}
                        label={`${reportData?.siteVariationPercentage}% ${t("brigade.cards.numberThisWeek")}`}
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

                  {team?.members?.map((member, index) => (
                    <View
                      key={member.id}
                      className={`flex-row items-center p-4 border-neutral-200 ${index === team?.members?.length - 1 ? "border-b-0 rounded-b-xl" : "border-b"}`}
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
