import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import useAxios from "axios-hooks";
import { deserialize } from "jsonapi-fractal";
import { Platform, StatusBar } from "react-native";

import { RadioButton } from "@/components/themed";
import { BaseObject, Team } from "@/schema";
import {
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  SafeAreaView,
  Loading,
} from "@/components/themed";
import { useBrigades } from "@/hooks/useBrigades";

export default function FilterBrigade() {
  const { t } = useTranslation();
  const { setFilter } = useBrigades();

  const [teamSelected, setTeamSelected] = useState<BaseObject>();
  const [searchText, setSearchText] = useState<string>("");
  const [itemOptions, setItemOptions] = useState<Team[]>([]);
  const router = useRouter();

  const onFilter = () => {
    setFilter({ team: teamSelected });
    router.back();
  };

  const [{ data, loading, error }] = useAxios({
    url: `/teams`,
    params: {
      "filter[name]": searchText,
      "page[number]": 1,
      "page[size]": 100,
    },
  });

  useEffect(() => {
    if (data) {
      const deserializedData = deserialize<Team>(data);
      if (!deserializedData || !Array.isArray(deserializedData)) return;

      setItemOptions(deserializedData);
      setTeamSelected(undefined);
    }
  }, [data]);

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
            onChangeText={(value) => setSearchText(value)}
            style={{ borderWidth: 0 }}
          />
        </View>

        {loading && (
          <View className="my-4">
            <Loading />
          </View>
        )}

        {!loading && error !== undefined && !itemOptions.length && (
          <View className="my-4">
            <Text>{t("errorCodes.generic")}</Text>
          </View>
        )}

        <ScrollView className="pb-4" showsVerticalScrollIndicator={false}>
          {!loading && itemOptions.length > 0 && (
            <View className="my-1">
              {itemOptions.map((team) => (
                <RadioButton
                  value={team.id === teamSelected?.id}
                  onValueChange={() => {
                    setTeamSelected(team);
                  }}
                  label={renderItem(team)}
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
