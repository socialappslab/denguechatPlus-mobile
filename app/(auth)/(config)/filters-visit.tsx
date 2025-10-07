import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { Button, ListItem, SafeAreaView, View } from "@/components/themed";

import { useFilters } from "@/hooks/useFilters";
import { Platform, StatusBar } from "react-native";

export default function FiltersBrigade() {
  const { t } = useTranslation();
  const { filters, clearState } = useFilters();

  const router = useRouter();

  const onPressFilterSector = () => {
    router.push("/filter-sector-visit");
  };

  const onPressFilterWedge = () => {
    router.push("/filter-wedge-visit");
  };

  const onPressFilterTeam = () => {
    router.push("/filter-brigade-visit");
  };

  const onFilter = () => {
    router.push("/(auth)/(tabs)/visits");
  };

  const onClearFilters = () => {
    clearState();
  };

  return (
    <SafeAreaView edges={["right", "bottom", "left"]}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "default"}
      />
      <View className="flex flex-1 py-5 px-5">
        <View className="flex flex-1 mt-4">
          <ListItem
            title={t("config.sector")}
            onPressElement={onPressFilterSector}
            filled={filters.sector?.name}
            emptyString={t("config.allSectors")}
          />
          <ListItem
            title={t("config.wedge")}
            onPressElement={onPressFilterWedge}
            filled={filters.wedge?.name}
            emptyString={t("config.allWedges")}
          />
          <ListItem
            title={t("config.brigade")}
            onPressElement={onPressFilterTeam}
            filled={filters.team?.name}
            emptyString={t("config.allBrigades")}
          />
        </View>
        <View className="pt-5">
          <Button primary onPress={onFilter} title={t("config.filter")} />
        </View>
        <View className="pt-5">
          <Button onPress={onClearFilters} title={t("config.clearFilters")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
