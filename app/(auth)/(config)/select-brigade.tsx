import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { deserialize } from "jsonapi-fractal";
import {
  FlatList,
  ListRenderItem,
  Platform,
  RefreshControl,
} from "react-native";
import { debounce } from "lodash";
import { useIsFocused } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";

import {
  FilterButton,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Loading,
  ListItem,
} from "@/components/themed";

import { countSetFilters, getInitialsBase } from "@/util";
import Colors from "@/constants/Colors";
import { axios } from "@/config/axios";

import { useBrigades } from "@/hooks/useBrigades";
import { Team } from "@/schema";

export default function SelectBrigade() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [dataList, setDataList] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();
  const { filters, setSelection } = useBrigades();

  const fetchData = async (
    page: number,
    query: string,
    sectorId?: number,
    wedgeId?: number,
  ) => {
    setError("");
    try {
      const response = await axios.get("teams", {
        params: {
          "page[number]": page,
          "page[size]": 15,
          sort: "name",
          order: "asc",
          "filter[name]": query,
          "filter[sector_id]": sectorId,
          "filter[wedge_id]": wedgeId,
        },
      });

      const data = response.data;

      if (data) {
        const deserializedData = deserialize<Team>(data);
        if (!deserializedData || !Array.isArray(deserializedData)) return;

        if (page === 1) {
          setDataList(deserializedData);
        } else {
          setDataList((prevData) => {
            let updatedList = [...prevData, ...deserializedData];

            const uniqueList = Array.from(
              new Set(updatedList.map((item) => item.id)),
            )
              .map((id) => updatedList.find((item) => item.id === id))
              .filter((item): item is Team => item !== undefined);

            return uniqueList;
          });
        }

        setHasMore(data.links?.self !== data.links?.last);
      }
    } catch (error) {
      setError(t("errorCodes.generic"));
      Sentry.captureException(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const debouncedFetchData = debounce(fetchData, 200);

  useEffect(() => {
    return () => {
      debouncedFetchData.cancel();
    };
  }, [debouncedFetchData]);

  const handleSearch = async (query: string) => {
    setSearchText(query);
    setCurrentPage(1);
    setHasMore(true);
    setLoading(true);
    debouncedFetchData(1, query, filters?.sector?.id, filters?.wedge?.id);
  };

  const loadMoreData = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      setCurrentPage(nextPage);
      debouncedFetchData(
        nextPage,
        searchText,
        filters?.sector?.id,
        filters?.wedge?.id,
      );
    }
  };

  const renderSpinner = () => {
    if (!loadingMore) return null;

    return (
      <View className="py-4">
        <Loading />
      </View>
    );
  };

  const onPressElement = (team: Team) => {
    setSelection({ newBrigade: team, newHouseBlock: undefined });
    router.back();
  };

  const onPressFilter = () => {
    router.push("/filters-brigade");
  };

  const firstLoad = () => {
    setSearchText("");
    setDataList([]);
    setHasMore(true);
    setCurrentPage(1);
    fetchData(1, "", filters?.sector?.id, filters?.wedge?.id);
  };

  useEffect(() => {
    if (isFocused) {
      firstLoad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, filters]);

  const renderItem: ListRenderItem<Team> = ({ item: team }) => {
    return (
      <ListItem
        key={String(team.id)}
        square
        title={`${team?.name}`}
        initials={getInitialsBase(String(team.name), "")}
        onPressElement={() => onPressElement(team)}
        filled={`${team?.sector} - ${team?.wedge}`}
      />
    );
  };

  const showNoResultsOrErrors = () => {
    if (error) {
      return <Text>{error}</Text>;
    }
    if (!loading && dataList?.length === 0 && !hasMore) {
      return <Text>{t("config.noResults")}</Text>;
    }
    return null;
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5">
        <View className="flex flex-row items-center mb-6">
          <View className="flex flex-1 mr-2">
            <TextInput
              search
              className="flex-1"
              placeholder={t("config.search")}
              value={searchText}
              onClear={() => handleSearch("")}
              onChangeText={handleSearch}
            />
          </View>
          <FilterButton
            filters={countSetFilters(filters, ["wedge", "sector"])}
            onPress={onPressFilter}
          />
        </View>
        {loading && (
          <View className="my-4">
            <Loading />
          </View>
        )}
        {!loading && (
          <FlatList
            contentContainerStyle={{ paddingBottom: 20 }}
            data={dataList}
            refreshControl={
              <RefreshControl
                progressViewOffset={Platform.OS === "ios" ? 20 : undefined}
                refreshing={loading || loadingMore}
                onRefresh={firstLoad}
                colors={[Colors.light.primary]}
                tintColor={Colors.light.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            keyExtractor={(item: Team, index: number) => String(item.id)}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.9}
            ListEmptyComponent={showNoResultsOrErrors}
            ListFooterComponent={renderSpinner}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
