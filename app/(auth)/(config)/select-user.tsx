import { useState, useEffect, useCallback } from "react";
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

import {
  FilterButton,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Loading,
  ListItem,
} from "@/components/themed";
import { IUser } from "@/schema/auth";

import { countSetFilters, getInitialsBase } from "@/util";
import Colors from "@/constants/Colors";
import { authApi } from "@/config/axios";
import { BaseObject } from "@/schema";
import { useBrigades } from "@/hooks/useBrigades";

export default function SelectUser() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [dataList, setDataList] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();
  const { filters, setSelection } = useBrigades();

  const fetchData = async (page: number, query: string, teamId?: number) => {
    setError("");
    try {
      const response = await authApi.get("users", {
        params: {
          "filter[status][]": "active",
          "page[number]": page,
          "page[size]": 15,
          sort: "user_profiles.first_name",
          order: "asc",
          "filter[full_name]": query,
          "filter[role_name]": "brigadista",
          "filter[team_id]": teamId,
        },
      });

      const data = response.data;
      if (data) {
        const deserializedData = deserialize<IUser>(data);
        if (!deserializedData || !Array.isArray(deserializedData)) return;

        // console.log(
        //   `rows of PAGE ${page} with TEXT "${query}" and TEAM ID ${teamId} >>>>`,
        //   deserializedData.map(
        //     (user, index) => `${user.id}-${user.firstName}-${user.lastName}\n`,
        //   ),
        // );

        if (page === 1) {
          setDataList(deserializedData);
        } else {
          setDataList((prevData) => {
            let updatedList = [...prevData, ...deserializedData];

            const uniqueList = Array.from(
              new Set(updatedList.map((item) => item.id)),
            )
              .map((id) => updatedList.find((item) => item.id === id))
              .filter((item): item is IUser => item !== undefined);

            return uniqueList;
          });
        }

        // console.log("data.links>>>", data.links);
        setHasMore(data.links?.self !== data.links?.last);
      }
    } catch (err) {
      setError(t("errorCodes.generic"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const debouncedFetchData = useCallback(debounce(fetchData, 200), []);

  useEffect(() => {
    return () => {
      debouncedFetchData.cancel();
    };
  }, [debouncedFetchData]);

  const handleSearch = async (query: string) => {
    // console.log("handleSearch>>>> ", query);
    setSearchText(query);
    setCurrentPage(1);
    setHasMore(true);
    setLoading(true);
    debouncedFetchData(1, query, filters?.team?.id);
  };

  const loadMoreData = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      console.log("loadMoreData>>>> ", nextPage);
      setCurrentPage(nextPage);
      fetchData(nextPage, searchText, filters?.team?.id);
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

  const onPressElement = (user: IUser) => {
    console.log("onPressElement>>>> ", user);
    setSelection({ brigader: user });
    router.push(`/change-brigade`);
  };

  const onPressFilter = () => {
    router.push(`/filters-users`);
  };

  const firstLoad = (team?: BaseObject) => {
    setSearchText("");
    setDataList([]);
    setHasMore(true);
    setCurrentPage(1);
    fetchData(1, "", team?.id);
  };

  useEffect(() => {
    if (isFocused) {
      firstLoad(filters?.team);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, filters]);

  const renderItem: ListRenderItem<IUser> = ({ item: user }) => {
    return (
      <ListItem
        key={String(user.id)}
        title={`${user?.firstName} ${user?.lastName}`}
        initials={getInitialsBase(
          String(user.firstName),
          String(user.lastName),
        )}
        onPressElement={() => onPressElement(user)}
        filled={(user?.team as BaseObject)?.name}
        emptyString={t("config.noBrigade")}
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
            filters={countSetFilters(filters, ["team"])}
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
            keyExtractor={(item: IUser, index: number) => String(item.id)}
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
