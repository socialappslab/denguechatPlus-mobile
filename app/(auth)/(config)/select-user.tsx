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
import { IUser } from "@/schema/auth";

import { countSetFilters, getInitialsBase } from "@/util";
import Colors from "@/constants/Colors";
import { axios } from "@/config/axios";
import { BaseObject } from "@/schema";
import { useBrigades } from "@/hooks/useBrigades";
import { useDebounceCallback } from "usehooks-ts";

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
  const { filters, setSelection, clearState } = useBrigades();

  const fetchData = useCallback(
    async (page: number, query: string, teamId?: number) => {
      setError("");
      try {
        const response = await axios.get("users", {
          params: {
            "filter[status][]": "active",
            page: {
              number: page,
              size: 15,
            },
            sort: "user_profiles.first_name",
            order: "asc",
            filter: {
              full_name: query,
              role_name: "brigadista",
              team_id: teamId,
            },
          },
        });

        const data = response.data;
        if (data) {
          const deserializedData = deserialize<IUser>(data);
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
                .filter((item): item is IUser => item !== undefined);

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
    },
    [t],
  );

  const debouncedFetchData = useDebounceCallback(fetchData, 700);

  const handleSearch = async (query: string) => {
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
      setCurrentPage(nextPage);
      fetchData(nextPage, searchText, filters?.team?.id);
    }
  };

  function renderSpinner() {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <Loading />
      </View>
    );
  }

  function onPressElement(user: IUser) {
    clearState();
    setSelection({ brigader: user });
    router.push(`/change-house-group`);
  }

  function firstLoad(team?: BaseObject) {
    setSearchText("");
    setDataList([]);
    setHasMore(true);
    setCurrentPage(1);
    fetchData(1, "", team?.id);
  }

  useEffect(() => {
    if (isFocused) {
      firstLoad(filters?.team);
    }
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
    <SafeAreaView edges={["right", "bottom", "left"]}>
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
            onPress={() => {
              router.push(`/filters-users`);
            }}
          />
        </View>

        {loading ? (
          <View className="my-4">
            <Loading />
          </View>
        ) : (
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
            keyExtractor={(item: IUser) => String(item.id)}
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
