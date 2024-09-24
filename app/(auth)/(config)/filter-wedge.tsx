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
import { Wedge } from "@/types";

export default function FilterWedge() {
  const { t } = useTranslation();
  const { filters, setFilter } = useBrigades();

  const [itemSelected, setWedgeSelected] = useState<BaseObject>();
  const [searchText, setSearchText] = useState<string>("");
  const [itemOptions, setWedgeOptions] = useState<Wedge[]>([]);
  const router = useRouter();

  const onFilter = () => {
    console.log("onFilter>>>> ", itemSelected);
    setFilter({ wedge: itemSelected });
    router.back();
  };

  const [{ data, loading, error }] = useAxios({
    url: `/wedges`,
    params: {
      "filter[sector_id]": filters.sector?.id,
      "filter[name]": searchText,
      "page[number]": 1,
      "page[size]": 100,
    },
  });

  useEffect(() => {
    if (data) {
      try {
        const deserializedData = deserialize<Wedge>(data);
        if (!deserializedData || !Array.isArray(deserializedData)) return;
        setWedgeOptions(deserializedData);
        setWedgeSelected(undefined);
      } catch (e) {
        setWedgeOptions([]);
        setWedgeSelected(undefined);
      }
    }
  }, [data]);

  const renderItem = (item: Wedge) => {
    return `${item.name}`;
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

        {!loading && !!error && !itemOptions.length && (
          <View className="my-4">
            <Text>{t("errorCodes.generic")}</Text>
          </View>
        )}

        {!loading && !error && !itemOptions.length && (
          <View className="my-4">
            <Text>{t("config.noResultsWedges")}</Text>
          </View>
        )}

        <ScrollView className="pb-4" showsVerticalScrollIndicator={false}>
          {!loading && itemOptions.length > 0 && (
            <View className="my-1">
              {itemOptions.map((item) => (
                <SelectableItem
                  key={item.id}
                  checked={item.id === itemSelected?.id}
                  onValueChange={() => {
                    setWedgeSelected(item);
                  }}
                  label={renderItem(item)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View className="pt-5">
          <Button primary onPress={onFilter} title={t("config.filter")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
