import { useIsFocused } from "@react-navigation/native";
import useAxios from "axios-hooks";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import { useEffect, useState } from "react";
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
import { ReportData } from "@/types";
import { getInitials } from "@/util";
import { RefreshControl } from "react-native-gesture-handler";

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
  const wedgeId = meData?.userProfile?.team?.wedge_id;
  const sectorId = meData?.userProfile?.team?.sector_id;

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
            {loadingTeam && (
              <View className="flex flex-1 items-center justify-center">
                <Loading />
              </View>
            )}
            {!loadingTeam && (
              <ScrollView
                className="py-5 px-5"
                showsVerticalScrollIndicator={false}
              >
                <View className="mb-2">
                  <Text className="text-xl font-bold mb-2">{team?.name}</Text>
                  <Text className="font-normal mb-2">
                    {team?.sector?.name} - {team?.wedge?.name}
                  </Text>
                  {meData?.userProfile?.houseBlock?.name && (
                    <Text className="font-normal mb-4">
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
                      progress={reportData?.greenQuantity ?? 0}
                      color="verde-600"
                    />
                    <ProgressBar
                      label={t("brigade.sites.yellow")}
                      progress={reportData?.orangeQuantity ?? 0}
                      color="yellow-400"
                    />
                    <ProgressBar
                      label={t("brigade.sites.red")}
                      progress={reportData?.redQuantity ?? 0}
                      color="red-600"
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
