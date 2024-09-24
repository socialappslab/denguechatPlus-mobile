import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { deserialize } from "jsonapi-fractal";
import { Platform, StatusBar } from "react-native";
import { debounce } from "lodash";
import { useIsFocused } from "@react-navigation/native";

import { BaseObject, Team } from "@/schema";
import {
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  SelectableItem,
  SafeAreaView,
  Loading,
} from "@/components/themed";
import { authApi } from "@/config/axios";

export interface FilterModalProps {
  onFilter: (itemSeleted?: BaseObject) => void;
  endpoint: string;
  messageNoResults?: string;
  messageNoResultsOnSelection?: string;
  extraSearchParams?: Record<string, string | number | undefined>;
}

export function FilterModal({
  onFilter,
  messageNoResults,
  messageNoResultsOnSelection,
  endpoint,
  extraSearchParams,
}: FilterModalProps) {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const [itemSelected, setItemSelected] = useState<BaseObject>();
  const [searchText, setSearchText] = useState<string>("");
  const [itemOptions, setItemOptions] = useState<Team[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFilter = () => {
    console.log("handleFilter>>>> ", itemSelected);
    onFilter(itemSelected);
  };

  const fetchData = async (query: string) => {
    setError("");
    try {
      const response = await authApi.get(endpoint, {
        params: {
          "filter[name]": query,
          "page[number]": 1,
          "page[size]": 100,
          ...extraSearchParams,
        },
      });

      const data = response.data;
      if (data) {
        const deserializedData = deserialize<Team>(data);
        if (!deserializedData || !Array.isArray(deserializedData)) return;

        console.log("deserializedData ITEMS>>>>>>>>>>", deserializedData);
        setItemOptions(deserializedData);
        setItemSelected(undefined);
      }
    } catch (err) {
      console.log("err>>>> ", err);
      setError(t("errorCodes.generic"));
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchData = useCallback(debounce(fetchData, 300), []);

  useEffect(() => {
    return () => {
      debouncedFetchData.cancel();
    };
  }, [debouncedFetchData]);

  const handleSearch = async (query: string) => {
    setSearchText(query);
    setLoading(true);
    debouncedFetchData(query);
  };

  const firstLoad = () => {
    setSearchText("");
    setItemOptions([]);
    setLoading(true);
    fetchData("");
  };

  useEffect(() => {
    if (isFocused) {
      firstLoad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const renderItem = (team: Team) => {
    return `${team.name}`;
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
            onClear={() => handleSearch("")}
            onChangeText={handleSearch}
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

        {!loading && !error && !itemOptions.length && !!searchText && (
          <View className="my-4">
            <Text>{messageNoResults || t("config.noResults")}</Text>
          </View>
        )}

        {!loading && !error && itemOptions.length === 0 && !searchText && (
          <View className="my-4">
            <Text>{messageNoResultsOnSelection}</Text>
          </View>
        )}

        <ScrollView className="pb-4" showsVerticalScrollIndicator={false}>
          {!loading && itemOptions.length > 0 && (
            <View className="my-1">
              {itemOptions.map((team) => (
                <SelectableItem
                  key={team.id}
                  checked={team.id === itemSelected?.id}
                  onValueChange={() => {
                    setItemSelected(team);
                  }}
                  label={renderItem(team)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View className="pt-5">
          <Button primary onPress={handleFilter} title={t("config.filter")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
