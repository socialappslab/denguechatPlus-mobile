import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { View, Button, SafeAreaView, ListItem } from "@/components/themed";

import { Platform, StatusBar } from "react-native";
import { useBrigades } from "@/hooks/useBrigades";
import { useEffect } from "react";

export default function FiltersBrigade() {
  const { t } = useTranslation();
  const { filters, clearState } = useBrigades();

  const router = useRouter();

  const onPressFilterSector = () => {
    router.push("filter-sector");
  };

  const onPressFilterWedge = () => {
    router.push("filter-wedge");
  };

  const onPressFilterTeam = () => {
    router.push("filter-brigade");
  };

  const onFilter = () => {
    router.back();
  };

  const onClearFilters = () => {
    clearState();
  };

  return (
    <SafeAreaView>
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
