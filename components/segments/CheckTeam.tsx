import React from "react";

import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthProvider";

import { View, Text } from "@/components/themed";
import JoinTeam from "@/assets/images/join-brigade.svg";

export interface CheckTeamProps {
  view: "chat" | "visit" | "profile";
  children: React.ReactNode;
}

export const CheckTeam: React.FC<CheckTeamProps> = ({ view, children }) => {
  const { t } = useTranslation();
  const { meData } = useAuth();

  if (meData?.userProfile?.team && meData?.userProfile?.houseBlock) {
    return children;
  }

  return (
    <View className="flex-1 flex-col items-center justify-center px-10 min-h-screen -mt-24">
      <JoinTeam className="mb-4"></JoinTeam>
      <Text className="text-2xl font-bold mb-4">
        {t("brigade.joinBrigade.action")}
      </Text>
      <Text className="mb-2 text-center">
        {t(`brigade.joinBrigade.messages.${view}`)}
      </Text>
    </View>
  );
};
