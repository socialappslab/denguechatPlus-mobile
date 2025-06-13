import { PropsWithChildren } from "react";

import { useTranslation } from "react-i18next";

import { View, Text } from "@/components/themed";
import JoinTeam from "@/assets/images/join-brigade.svg";
import { useUserHasBrigade } from "@/hooks/useUserHasBrigade";

export const CheckTeam = ({
  view,
  children,
}: PropsWithChildren<{
  view: "chat" | "visit" | "profile";
}>) => {
  const { t } = useTranslation();
  const userHasBrigade = useUserHasBrigade();

  if (userHasBrigade) {
    return children;
  }

  return (
    <View className="flex-1 flex-col items-center justify-center px-10 min-h-screen -mt-24">
      <JoinTeam className="mb-4" />

      <Text className="text-2xl font-bold mb-4">
        {t("brigade.joinBrigade.action")}
      </Text>

      <Text className="mb-2 text-center">
        {t(`brigade.joinBrigade.messages.${view}`)}
      </Text>
    </View>
  );
};
