import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { deserialize } from "jsonapi-fractal";
import {
  FlatList,
  ListRenderItem,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";

import {
  Text,
  View,
  SafeAreaView,
  Loading,
  PostItem,
} from "@/components/themed";
import { Post } from "@/types";

import Colors from "@/constants/Colors";
import { authApi } from "@/config/axios";
import { Team } from "@/schema";
import { useAuth } from "@/context/AuthProvider";
import { SimpleSelectableChip } from "@/components/themed/SelectableChip";

export default function SelectUser() {
  const { t } = useTranslation();
  const { meData, reFetchMe } = useAuth();

  const isFocused = useIsFocused();
  const [all, setAll] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [dataList, setDataList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (isFocused) {
      reFetchMe();
      firstLoad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const fetchData = async (page: number, sectorId?: number) => {
    setError("");
    try {
      const response = await authApi.get("posts", {
        params: {
          "filter[sector_id]": sectorId,
          "page[number]": page,
          "page[size]": 15,
          sort: "created_at",
          order: "asc",
        },
      });

      const data = response.data;
      if (data) {
        const deserializedData = deserialize<Post>(data);
        if (!deserializedData || !Array.isArray(deserializedData)) return;

        // console.log(
        //   `rows of PAGE ${page} with SECTOR ID ${sectorId} >>>>`,
        //   deserializedData.map(
        //     (post, index) => `${post.id}-${post.createdBy}-${post.postText}\n`,
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
              .filter((item) => item !== undefined);

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

  const handleFilterChange = (all: boolean) => {
    setAll(all);
    setCurrentPage(1);
    setHasMore(true);
    setLoading(true);
    fetchData(
      1,
      all ? undefined : (meData?.userProfile?.team as Team)?.sector_id,
    );
  };

  const loadMoreData = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      console.log("loadMoreData>>>> ", nextPage);
      setCurrentPage(nextPage);
      fetchData(
        nextPage,
        all ? undefined : (meData?.userProfile?.team as Team)?.sector_id,
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

  const onPressElement = (post: Post) => {
    console.log("onPressElement>>>> ", post);
    router.push(`post/${post.id}`);
  };

  const onPressNewPost = () => {
    router.push(`new-post`);
  };

  const firstLoad = () => {
    setAll(true);
    setDataList([]);
    setHasMore(true);
    setCurrentPage(1);
    fetchData(1, undefined);
  };

  const renderItem: ListRenderItem<Post> = ({ item: post }) => {
    return (
      <PostItem
        key={String(post.id)}
        post={post}
        onPressElement={() => onPressElement(post)}
      />
    );
  };

  const showNoResultsOrErrors = () => {
    if (error) {
      return <Text>{error}</Text>;
    }
    if (!loading && dataList?.length === 0 && !hasMore) {
      return <Text>{t("chat.empty")}</Text>;
    }
    return null;
  };

  const handlePressAll = () => {
    handleFilterChange(true);
  };

  const handlePressMyBrigade = () => {
    handleFilterChange(false);
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5">
        <View className="flex flex-row items-center px-5 mb-4">
          <TouchableOpacity
            onPress={onPressNewPost}
            className={`flex flex-1 flex-row items-center border-gray-200 border rounded-lg py-2 px-4 h-11`}
          >
            <Text className="text-gray-300">{t("chat.sharePlaceholder")}</Text>
          </TouchableOpacity>
        </View>
        <View className="flex flex-row items-center px-5 mb-4">
          <SimpleSelectableChip
            className="mr-2"
            label={t("chat.visibility.all")}
            checked={all}
            onPressElement={handlePressAll}
          />
          <SimpleSelectableChip
            label={t("chat.visibility.myBrigade")}
            checked={!all}
            disabled={!(meData?.userProfile?.team as Team)?.sector_id}
            onPressElement={handlePressMyBrigade}
          />
        </View>
        {loading && (
          <View className="my-4">
            <Loading />
          </View>
        )}
        {!loading && (
          <FlatList
            contentContainerStyle={{ paddingBottom: 30 }}
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
            keyExtractor={(item: Post, index: number) => String(item.id)}
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
