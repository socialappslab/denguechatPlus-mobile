import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthProvider";
import { Text, View, ScrollView, SafeAreaView } from "@/components/themed";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import useAxios from "axios-hooks";
import { useIsFocused } from "@react-navigation/native";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";

import { BaseObject, ErrorResponse, Team, TEAM_LEADER_ROLE } from "@/schema";
import { CheckTeam } from "@/components/segments/CheckTeam";
import Colors from "@/constants/Colors";
import { getInitials } from "@/util";
import { SimpleChip, ProgressBar, Loading } from "@/components/themed";

// example JSON Data
const visitsData = {
  weeklyChange: "+15%",
};

const sitesData = {
  totalSites: 170,
  weeklyChange: "+15%",
};

export default function Profile() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { meData, reFetchMe } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (isFocused) reFetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const [{ data: teamData, loading: loadingTeam }, refetchTeam] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >({
    url: `teams/${(meData?.userProfile?.team as BaseObject)?.id}`,
  });

  useEffect(() => {
    if (meData) refetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData]);

  useEffect(() => {
    if (!teamData) return;
    const deserializedData = deserialize<Team>(teamData);
    console.log("deserializedData TEAM>>>>>>>>>>", deserializedData);
    if (deserializedData && !Array.isArray(deserializedData)) {
      setTeam(deserializedData);
    }
  }, [teamData]);

  return (
    <SafeAreaView>
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
                <Text className="font-normal mb-4">
                  {team?.sector?.name} - {team?.wedge?.name}
                </Text>
              </View>
              <View className="p-4 mb-4 border border-gray-200 rounded-lg">
                <Text className="text-gray-600 mb-2">
                  {t("brigade.cards.numberVisits")}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-3xl font-semibold">
                    {team?.visits ?? 0}
                  </Text>
                  <SimpleChip
                    border="1"
                    padding="small"
                    textColor="neutral"
                    borderColor="neutral"
                    ionIcon="arrow-up"
                    iconColor={Colors.light.neutral}
                    label={`${visitsData.weeklyChange} ${t("brigade.cards.numberThisWeek")}`}
                  />
                </View>
              </View>

              <View className="p-4 mb-4 border border-gray-200 rounded-lg">
                <Text className="text-gray-600 mb-2">
                  {t("brigade.cards.numberSites")}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-3xl font-semibold">
                    {sitesData.totalSites}
                  </Text>

                  <SimpleChip
                    border="1"
                    padding="small"
                    textColor="neutral"
                    borderColor="neutral"
                    ionIcon="arrow-up"
                    iconColor={Colors.light.neutral}
                    label={`${sitesData.weeklyChange} ${t("brigade.cards.numberThisWeek")}`}
                  />
                </View>
                <View className="flex flex-col mt-6">
                  <ProgressBar
                    label={t("brigade.sites.green")}
                    progress={team?.sitesStatuses?.green ?? 0}
                    color="primary"
                  />
                  <ProgressBar
                    label={t("brigade.sites.yellow")}
                    progress={team?.sitesStatuses?.yellow ?? 0}
                    color="yellow-50"
                  />
                  <ProgressBar
                    label={t("brigade.sites.red")}
                    progress={team?.sitesStatuses?.red ?? 0}
                    color="red-500"
                  />
                </View>
              </View>

              <View className="rounded-lg border border-gray-200 mb-8">
                <View className="bg-gray-100 border-b border-gray-200 rounded-t-lg px-4 py-4">
                  <Text className="text-gray-600 font-medium">
                    {t("brigade.cards.participants")}
                  </Text>
                </View>

                {team?.members?.map((member, index) => (
                  <View
                    key={member.id}
                    className={`flex-row items-center p-4 border-gray-200 ${index === team?.members?.length - 1 ? "border-b-0 rounded-b-xl" : "border-b"}`}
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
                        backgroundColor="blue-100"
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
    </SafeAreaView>
  );
}
