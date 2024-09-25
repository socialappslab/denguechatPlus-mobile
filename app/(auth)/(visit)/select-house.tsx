import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import useAxios from "axios-hooks";
import { deserialize } from "jsonapi-fractal";
import { useIsFocused } from "@react-navigation/native";

import { SelectableItem } from "@/components/themed";
import { House } from "@/types";
import { useVisit } from "@/hooks/useVisit";

import {
  Text,
  View,
  Button,
  TextInput,
  ScrollView,
  SafeAreaView,
  Loading,
} from "@/components/themed";
import { formatDate } from "@/util";

export default function SelectHouseScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const [houseSelectedId, setHouseSelectedId] = useState<number>();
  const [searchText, setSearchText] = useState<string>("");
  const [houseOptions, setHouseOptions] = useState<House[]>([]);
  const router = useRouter();

  const { setVisitData, questionnaire, language } = useVisit();

  const updateHouse = async () => {
    await setVisitData({ houseId: houseSelectedId });
    router.push(`visit/${questionnaire?.initialQuestion}`);
  };

  const [{ data, loading, error }, refetch] = useAxios(
    {
      url: `/houses/list_to_visit?filter[reference_code]=${searchText}`,
    },
    { manual: true },
  );

  useEffect(() => {
    if (isFocused) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  useEffect(() => {
    if (data) {
      const deserializedData = deserialize<House>(data);
      if (!deserializedData || !Array.isArray(deserializedData)) return;

      setHouseOptions(deserializedData);
      setHouseSelectedId(undefined);
    }
  }, [data]);

  const renderHouse = (house: House) => {
    const lastVisit = house.lastVisit
      ? `(${formatDate(house.lastVisit, language, t("visit.houses.notVisited"))})`
      : "";
    return `${house.specialPlace ? house.specialPlace.name : t("visit.houses.house")} ${house.referenceCode} ${lastVisit}`;
  };

  const renderTitle = (houses: House[]) => {
    if (houses.length === 0) {
      return "";
    }

    const house = houses[0];

    const houseBlock = house.houseBlock ? ` - ${house.houseBlock.name}` : "";
    const houseWedge = house.wedge ? ` - ${house.wedge.name}` : "";
    return `${house.neighborhood?.name}${houseWedge}${houseBlock}`;
  };

  const handleNewHouse = () => {
    router.push("new-house");
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5">
        <Text className="text-xl font-bold mb-4">
          {t("visit.houses.search")}
        </Text>
        <View className="mb-6">
          <TextInput
            search
            placeholder={t("visit.houses.searchPlaceholder")}
            className="flex-1 ml-2"
            value={searchText}
            onChangeText={(value) => setSearchText(value)}
            style={{ borderWidth: 0 }}
          />
        </View>

        {loading && (
          <View className="my-4">
            <Loading />
          </View>
        )}

        {!loading && houseOptions.length > 0 && (
          <View className="mb-2">
            <Text className="text-xl font-bold mb-2">
              {t("visit.houses.optionsTitle")}
            </Text>
            <Text className="text-md font-normal mb-4">
              {renderTitle(houseOptions)}
            </Text>
          </View>
        )}

        <ScrollView className="pb-4" showsVerticalScrollIndicator={false}>
          {!loading && houseOptions.length > 0 && (
            <View className="my-1">
              {houseOptions.map((house) => (
                <SelectableItem
                  checked={house.id === houseSelectedId}
                  onValueChange={() => {
                    setHouseSelectedId(house.id);
                  }}
                  label={renderHouse(house)}
                  chip={house.specialPlace && t("visit.houses.specialPlace")}
                />
              ))}
            </View>
          )}

          <View className="my-6 p-8 rounded-2xl border border-gray-300">
            <Text className="text-xl font-bold text-center mb-2">
              {t("visit.houses.noHouses")}
            </Text>
            <Text className="text-center mb-6">
              {t("visit.houses.noHousesMessage")}
            </Text>
            <Button
              onPress={handleNewHouse}
              title={t("visit.houses.registerNewHouse")}
              className="bg-green-400 border-green-400"
            />
          </View>
        </ScrollView>
        <View className="pt-5">
          <Button
            primary
            disabled={!houseSelectedId}
            onPress={updateHouse}
            title={t("next")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
