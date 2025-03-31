import { Button, SafeAreaView, Text, View } from "@/components/themed";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import SuccessIcon from "@/assets/images/icons/icon-success.svg";

export default function RegisterSuccess() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView>
      <View className="flex-1 items-center justify-center p-6">
        <SuccessIcon />

        <Text className="text-2xl font-semibold text-center">
          {t("registerSuccess.success")}
        </Text>
        <Text className="text-center mt-2">
          {t("registerSuccess.successDescription")}
        </Text>

        <Button
          primary
          title={t("backToHome")}
          className="mt-4"
          onPress={() => {
            router.navigate("/login");
          }}
        />
      </View>
    </SafeAreaView>
  );
}
