import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthProvider";
import { Text, View, ScrollView, SafeAreaView } from "@/components/themed";

import { useTranslation } from "react-i18next";
import useAxios from "axios-hooks";

import { SimpleChip, ProgressBar } from "@/components/themed";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import { BaseObject, ErrorResponse, Team, TEAM_LEADER_ROLE } from "@/schema";
import { CheckTeam } from "@/components/segments/CheckTeam";

// example JSON Data
const visitsData = {
  visits: 1210,
  weeklyChange: "+15%",
};

const sitesData = {
  totalSites: 170,
  weeklyChange: "+15%",
  greenSites: 75,
  yellowSites: 60,
  redSites: 35,
};

const getInitials = (fullName: string) => {
  const [firstName = "", lastName = ""] = fullName.split(" ");
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);

  const [{ data: teamData }] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >({
    url: `teams/${(user?.team as BaseObject)?.id}`,
  });

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
          <ScrollView className="py-5 px-5">
            <View className="p-4 mb-4 border border-gray-200 rounded-lg">
              <Text className="text-md text-gray-600 mb-2">
                Número de visitas
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-3xl font-semibold">
                  {visitsData.visits}
                </Text>
                <SimpleChip
                  ionIcon="arrow-up"
                  label={`${visitsData.weeklyChange} esta semana`}
                />
              </View>
            </View>

            <View className="p-4 mb-4 border border-gray-200 rounded-lg">
              <Text className="text-md text-gray-600 mb-2">
                Número de sitios
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-3xl font-semibold">
                  {sitesData.totalSites}
                </Text>

                <SimpleChip
                  ionIcon="arrow-up"
                  label={`${sitesData.weeklyChange} esta semana`}
                />
              </View>
              <View className="flex flex-col mt-6">
                <ProgressBar
                  label="Sitios Verdes"
                  progress={sitesData.greenSites}
                  color="primary"
                />
                <ProgressBar
                  label="Sitios Amarillos"
                  progress={sitesData.yellowSites}
                  color="yellow"
                />
                <ProgressBar
                  label="Sitios Rojos"
                  progress={sitesData.redSites}
                  color="red-500"
                />
              </View>
            </View>

            <View className="rounded-lg border border-gray-200 mb-8">
              <View className="bg-gray-100 border-b border-gray-200 rounded-t-lg px-4 py-4">
                <Text className="text-gray-600 font-medium">Participantes</Text>
              </View>

              {team?.members?.map((member, index) => (
                <View
                  key={member.id}
                  className={`flex-row items-center p-4 border-gray-200 ${index === team?.members?.length - 1 ? "border-b-0 rounded-b-xl" : "border-b"}`}
                >
                  <View className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mr-3">
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
                      label={`${"Facilitador"}`}
                    />
                  )}
                </View>
              ))}
            </View>
            <View className="h-6"></View>
          </ScrollView>
        </View>
      </CheckTeam>
    </SafeAreaView>
  );
}
