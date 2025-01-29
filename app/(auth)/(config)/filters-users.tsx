import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { View, Button, SafeAreaView, ListItem } from "@/components/themed";

import { Platform, StatusBar } from "react-native";
import { useBrigades } from "@/hooks/useBrigades";

export default function FiltersUsers() {
  const { t } = useTranslation();
  const { filters } = useBrigades();

  const router = useRouter();

  const onPressElement = () => {
    router.push("/filter-brigade");
  };

  const onFilter = () => {
    router.back();
  };

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "default"}
      />
      <View className="flex flex-1 py-5 px-5">
        <View className="flex flex-1 mt-4">
          <ListItem
            title={t("config.brigade")}
            onPressElement={onPressElement}
            filled={filters.team?.name}
            emptyString={t("config.allBrigades")}
          />
        </View>
        <View className="pt-5">
          <Button primary onPress={onFilter} title={t("config.filter")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
