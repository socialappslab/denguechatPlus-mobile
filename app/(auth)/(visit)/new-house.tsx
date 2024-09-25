import { useState, useEffect } from "react";
import { useRouter } from "expo-router";

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
import { SimpleChip, ProgressBar, Loading, Button } from "@/components/themed";
import { House } from "@/types";
import { useVisit } from "@/hooks/useVisit";

export default function NewHouse() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { meData, reFetchMe } = useAuth();

  const { setVisitData, questionnaire } = useVisit();
  const router = useRouter();

  const onBack = () => {
    router.back();
  };

  const onNext = async () => {
    // await setVisitData({ house: {} });
    router.push(`visit/${questionnaire?.initialQuestion}`);
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        <ScrollView
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        ></ScrollView>
        <View className="flex flex-row gap-2">
          <View className="flex-1">
            <Button title={t("back")} onPress={onBack} />
          </View>
          <View className="flex-1">
            <Button primary title={t("next")} onPress={onNext} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
