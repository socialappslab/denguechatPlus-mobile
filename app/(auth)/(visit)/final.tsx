import FinalIllustration from "@/assets/images/final.svg";
import { Button, Text, View } from "@/components/themed";
import { useVisit } from "@/hooks/useVisit";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Summary() {
  const { t } = useTranslation();
  const { isConnected } = useVisit();
  const router = useRouter();
  const prefix = isConnected ? "online" : "offline";

  return (
    <View className="h-full p-6 pt-20 pb-10 flex flex-col justify-between items-center">
      {/* This View is used for space between */}
      <View />
      <View className="flex flex-col justify-center items-center">
        <View className="h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center overflow-hidden">
          <FinalIllustration width="100%" height="100%" />
        </View>
        <View>
          <Text type="title" className="text-center mb-4">
            {t(`visit.final.title`)}
          </Text>
          <Text type="text" className="text-center px-10">
            {t(`visit.final.${prefix}.greetings`)}
          </Text>
        </View>
      </View>
      <View className="flex flex-row gap-2 self-end justify-self-end">
        <View className="flex-1">
          <Button
            primary
            title={t("backToHome")}
            onPress={() => {
              router.push({
                pathname: "/(auth)/(tabs)/visits",
                params: { reload: Date.now() },
              });
            }}
          />
        </View>
      </View>
    </View>
  );
}
