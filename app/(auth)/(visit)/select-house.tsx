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
import { SimpleChip } from "../../../components/themed/SimpleChip";

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
    const lastVisit = house.lastVisit ? formatDate(house.lastVisit) : "";
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
            <View className="space-y-2 mb-4">
              {houseOptions.map((house) => (
                <TouchableOpacity
                  key={house.id}
                  className={`flex flex-row items-center p-4 rounded-md ${house.id === houseSelectedId ? "bg-green-400" : "bg-gray-400"}`}
                  onPress={() => {
                    setHouseSelectedId(house.id);
                  }}
                >
                  <RadioButton
                    value={house.id === houseSelectedId}
                    className="bg-white mr-2"
                  />
                  <Text className="text-sky-400 font-medium text-sm/[17px] flex-grow ">
                    {renderHouse(house)}
                  </Text>
                  {house.specialPlace !== null && (
                    <SimpleChip
                      backgroundColor="green-300"
                      padding="small"
                      borderColor="green-400"
                      border="1"
                      label={t("visit.houses.specialPlace")}
                    />
                  )}
                </TouchableOpacity>
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
