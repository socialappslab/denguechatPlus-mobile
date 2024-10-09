import { useState, useEffect, useRef } from "react";
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
import { BottomSheetModal } from "@gorhom/bottom-sheet";

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
import CommentsSheet from "@/components/segments/CommentsSheet";

export default function Chat() {
  const { t } = useTranslation();
  const { meData, reFetchMe } = useAuth();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const isFocused = useIsFocused();
  const [all, setAll] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [dataList, setDataList] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (isFocused) {
      firstLoad();

      if (!meData) {
        reFetchMe();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, meData]);

  const fetchData = async (page: number, teamId?: number) => {
    setError("");
    try {
      const response = await authApi.get("posts", {
        headers: {
          source: "mobile",
        },
        params: {
          "filter[team_id]": teamId,
          "page[number]": page,
          "page[size]": 6,
          sort: "created_at",
          order: "desc",
        },
      });

      const data = response.data;
      if (data) {
        const deserializedData = deserialize<Post>(data);
        if (!deserializedData || !Array.isArray(deserializedData)) return;

        // console.log(
        //   `rows of PAGE ${page} with TEAM ID ${teamId} >>>>`,
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
      console.log("error>>>>>>", err);
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
    fetchData(1, all ? undefined : (meData?.userProfile?.team as Team)?.id);
  };

  const loadMoreData = () => {
    if (!loadingMore && hasMore && !error) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      console.log("loadMoreData>>>> ", nextPage);
      setCurrentPage(nextPage);
      fetchData(
        nextPage,
        all ? undefined : (meData?.userProfile?.team as Team)?.id,
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
    // router.push(`post/${post.id}`);
  };

  const onPressNewPost = () => {
    router.push(`/new-post`);
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
        onPressComments={() => handlePressComments(post)}
      />
    );
  };

  const showNoResultsOrErrors = () => {
    if (error) {
      return (
        <View className="flex flex-1 items-center justify-center">
          <Text className="font-thin">{error}</Text>
        </View>
      );
    }
    if (!loading && dataList?.length === 0 && !hasMore) {
      return (
        <View className="flex flex-1 items-center justify-center">
          <Text className="font-thin">{t("chat.empty")}</Text>
        </View>
      );
    }
    return null;
  };

  const handlePressAll = () => {
    handleFilterChange(true);
  };

  const handlePressMyBrigade = () => {
    handleFilterChange(false);
  };

  const handlePressComments = (post: Post) => {
    setSelectedPost(post);
    bottomSheetModalRef.current?.present();
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5">
        <View className="flex flex-row items-center px-5 mb-4">
          <TouchableOpacity
            onPress={onPressNewPost}
            className={`flex flex-1 flex-row items-center border-neutral-200 border rounded-lg py-2 px-4 h-11`}
          >
            <Text className="text-neutral-300">
              {t("chat.sharePlaceholder")}
            </Text>
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
            disabled={!(meData?.userProfile?.team as Team)?.id}
            onPressElement={handlePressMyBrigade}
          />
        </View>
        {loading && !loadingMore && (
          <View className="flex flex-1 items-center justify-center">
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
                refreshing={loadingMore}
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
            onEndReachedThreshold={0.2}
            ListEmptyComponent={showNoResultsOrErrors}
            ListFooterComponent={dataList.length ? renderSpinner : undefined}
          />
        )}
      </View>
      <View className={Platform.OS === "ios" ? "h-6" : "h-14"}></View>
      <CommentsSheet
        postId={selectedPost?.id}
        bottomSheetModalRef={bottomSheetModalRef}
      />
    </SafeAreaView>
  );
}
