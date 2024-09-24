import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import useAxios from "axios-hooks";
import { deserialize } from "jsonapi-fractal";
import { Platform, StatusBar } from "react-native";

import { BaseObject } from "@/schema";
import {
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  SafeAreaView,
  SelectableItem,
  Loading,
} from "@/components/themed";
import { useBrigades } from "@/hooks/useBrigades";
import { HouseBlock } from "@/types";

export default function SelectHouseBlock() {
  const { t } = useTranslation();
  const { selection, setSelection } = useBrigades();

  const [houseBlockSelected, setHouseBlockSelected] = useState<BaseObject>();
  const [searchText, setSearchText] = useState<string>("");
  const [houseBlockOptions, setHouseBlockOptions] = useState<HouseBlock[]>([]);
  const router = useRouter();

  const onFilter = () => {
    setSelection({ newHouseBlock: houseBlockSelected });
    router.back();
  };

  const [{ data, loading, error }] = useAxios({
    url: `house_blocks`,
    params: {
      "filter[team_id]": selection?.newBrigade?.id,
      "filter[name]": searchText,
      "page[number]": 1,
      "page[size]": 100,
    },
  });

  useEffect(() => {
    if (data) {
      const deserializedData = deserialize<HouseBlock>(data);
      if (!deserializedData || !Array.isArray(deserializedData)) return;

      setHouseBlockOptions(deserializedData);
      setHouseBlockSelected(undefined);
    }
  }, [data]);

  const renderItem = (houseBlock: HouseBlock) => {
    return `${houseBlock.name}`;
  };

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "default"}
      />
      <View className="flex flex-1 py-5 px-5">
        <View className="mb-6">
          <TextInput
            search
            placeholder={t("config.search")}
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

        {!loading && !!error && !houseBlockOptions.length && (
          <View className="my-4">
            <Text>{t("errorCodes.generic")}</Text>
          </View>
        )}

        {!loading && !error && !houseBlockOptions.length && (
          <View className="my-4">
            <Text>{t("config.noResultsHouseBlock")}</Text>
          </View>
        )}

        <ScrollView className="pb-4" showsVerticalScrollIndicator={false}>
          {!loading && houseBlockOptions.length > 0 && (
            <View className="my-1">
              {houseBlockOptions.map((houseBlock) => (
                <SelectableItem
                  key={houseBlock.id}
                  checked={houseBlock.id === houseBlockSelected?.id}
                  onValueChange={() => {
                    setHouseBlockSelected(houseBlock);
                  }}
                  label={renderItem(houseBlock)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View className="pt-5">
          <Button primary onPress={onFilter} title={t("config.select")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
