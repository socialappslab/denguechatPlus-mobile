import { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";

import { useRouter } from "expo-router";

import { RadioButton } from "@/components/themed";
import { House } from "@/types";
import useAxios from "axios-hooks";
import { deserialize } from "jsonapi-fractal";
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
import { useTranslation } from "react-i18next";

export default function SelectHouseScreen() {
  const { t } = useTranslation();

  const [houseSelectedId, setHouseSelectedId] = useState<number>();
  const [searchText, setSearchText] = useState<string>("");
  const [houseOptions, setHouseOptions] = useState<House[]>([]);
  const router = useRouter();

  const { setVisitData } = useVisit();

  const updateHouse = async () => {
    await setVisitData({ houseId: houseSelectedId });
    router.push("visit");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const locale = Intl.DateTimeFormat().resolvedOptions().locale;

    try {
      const formattedDate = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);

      return `(${formattedDate})`;
    } catch {
      return `(${t("visit.houses.notVisited")})`;
    }
  };

  const [{ data, loading, error }] = useAxios({
    url: `/houses/list_to_visit?filter[reference_code]=${searchText}`,
  });

  useEffect(() => {
    if (data) {
      const deserializedData = deserialize<House>(data);
      if (!deserializedData || !Array.isArray(deserializedData)) return;

      setHouseOptions(deserializedData);
      setHouseSelectedId(undefined);
    }
  }, [data]);

  const renderHouse = (house: House) => {
    // const houseBlock = house.houseBlock ? `, ${house.houseBlock.name}` : "";
    // const houseWedge = house.wedge ? `, ${house.wedge.name}` : "";
    const lastVisit = house.lastVisit
      ? formatDate(house.lastVisit)
      : `(${t("visit.houses.notVisited")})`;
    return `${t("visit.houses.house")} #${house.referenceCode} ${lastVisit}`;
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
            <Text className="text-md font-semibold mb-4">
              {t("visit.houses.optionsTitle")}
            </Text>
          </View>
        )}
        <ScrollView className="pb-4" showsVerticalScrollIndicator={false}>
          {!loading && houseOptions.length > 0 && (
            <View className="space-y-2 mb-4">
              {houseOptions.map((house) => (
                <TouchableOpacity
                  key={house.id}
                  className={`flex flex-row p-4 rounded-md ${house.id === houseSelectedId ? "bg-green-400" : "bg-gray-400"}`}
                  onPress={() => {
                    setHouseSelectedId(house.id);
                  }}
                >
                  <RadioButton
                    value={house.id === houseSelectedId}
                    className="bg-white mr-2"
                  />
                  <Text className="text-sky-400 font-medium text-sm/[17px]">
                    {renderHouse(house)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View className="my-6 p-8 rounded-2xl shadow-sm border border-gray-300">
            <Text className="text-lg font-semibold text-center mb-2">
              {t("visit.houses.noHouses")}
            </Text>
            <Text className="text-center mb-4">
              {t("visit.houses.noHousesMessage")}
            </Text>
            <Button
              title={t("visit.houses.registerNewHouse")}
              className="bg-green-100"
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
