import { useState, useEffect, useRef, useMemo } from "react";
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
import Toast from "react-native-toast-message";
import * as Sentry from "@sentry/react-native";

import {
  Text,
  View,
  SafeAreaView,
  Loading,
  PostItem,
} from "@/components/themed";
import { Post } from "@/types";
import Colors from "@/constants/Colors";
import { axios } from "@/config/axios";
import { Team } from "@/schema";
import { SimpleSelectableChip } from "@/components/themed/SelectableChip";
import CommentsSheet from "@/components/segments/CommentsSheet";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import { ActionItem } from "@/components/themed/ActionItem";
import { Button } from "@/components/themed";
import { useStore } from "@/hooks/useStore";

type PostState = Record<
  string,
  {
    post: Post;
    commentsCount: number;
    likedByUser: boolean;
    likesCount: number;
    loadingLike: boolean;
  }
>;

export default function Chat() {
  const { t } = useTranslation();
  const userProfile = useStore((state) => state.userProfile);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const isFocused = useIsFocused();
  const [all, setAll] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [dataList, setDataList] = useState<Post[]>([]);
  const [state, setState] = useState<PostState>({});

  const [selectedPost, setSelectedPost] = useState<Post>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const bottomSheetModalDeleteRef = useRef<BottomSheetModal>(null);
  const bottomSheetModalOptionsRef = useRef<BottomSheetModal>(null);
  const [unmountOptions, setUnmountOptions] = useState<boolean>(false);
  const snapPointsDelete = useMemo(() => ["45%"], []);
  const snapPointsOptions = useMemo(() => ["24%"], []);

  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (isFocused) {
      firstLoad();
    }
  }, [isFocused]);

  const fetchData = async (page: number, teamId?: number) => {
    setError("");
    try {
      const response = await axios.get("posts", {
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

        if (page === 1) {
          const uniqueList = Array.from(
            new Set(deserializedData.map((item) => item.id)),
          )
            .map((id) => deserializedData.find((item) => item.id === id))
            .filter((item): item is Post => item !== undefined);

          setState((prevState) => {
            const newState = { ...prevState };
            uniqueList.forEach((post) => {
              newState[`${post.id}`] = {
                post: post,
                commentsCount: post.commentsCount || 0,
                likedByUser: post.likedByUser ?? false,
                likesCount: post.likesCount ?? 0,
                loadingLike: false,
              };
            });

            return newState;
          });

          setDataList(uniqueList);
        } else {
          setDataList((prevData) => {
            let updatedList = [...prevData, ...deserializedData];

            const uniqueList = Array.from(
              new Set(updatedList.map((item) => item.id)),
            )
              .map((id) => updatedList.find((item) => item.id === id))
              .filter((item): item is Post => item !== undefined);

            setState((prevState) => {
              const newState = { ...prevState };
              uniqueList.forEach((post) => {
                newState[`${post.id}`] = {
                  post: post,
                  commentsCount: post.commentsCount || 0,
                  likedByUser: post.likedByUser ?? false,
                  likesCount: post.likesCount ?? 0,
                  loadingLike: false,
                };
              });

              return newState;
            });

            return uniqueList;
          });
        }

        // console.log("data.links>>>", data.links);
        setHasMore(data.links?.self !== data.links?.last);
      }
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
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
      all ? undefined : (userProfile?.userProfile?.team as Team)?.id,
    );
  };

  const loadMoreData = () => {
    if (!loadingMore && !loading && hasMore && !error) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      console.log("loadMoreData>>>> ", nextPage);
      setCurrentPage(nextPage);
      fetchData(
        nextPage,
        all ? undefined : (userProfile?.userProfile?.team as Team)?.id,
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

  const onPressNewPost = () => {
    router.push("/new-post");
  };

  const updateCommentCount = (diff: number) => {
    if (selectedPost) {
      setState((prev) => {
        const newState = { ...prev };
        const post = newState[`${selectedPost.id}`];
        if (!post) return prev;
        post.commentsCount += diff;
        return newState;
      });
    }
  };

  const firstLoad = () => {
    setDataList([]);
    setHasMore(true);
    setCurrentPage(1);
    fetchData(
      1,
      all ? undefined : (userProfile?.userProfile?.team as Team)?.id,
    );
    setUnmountOptions(false);
  };

  const handlePressLike = async (id: number) => {
    try {
      setState((prev) => {
        const newState = { ...prev };
        const post = newState[`${id}`];
        if (!post) return prev;
        post.likedByUser = !post.likedByUser;
        post.likesCount = prev[`${id}`].likedByUser
          ? prev[`${id}`].likesCount + 1
          : prev[`${id}`].likesCount - 1;
        post.loadingLike = true;
        return newState;
      });
      await axios.post(`posts/${id}/like`);
      console.log("Post liked:");
      setState((prev) => {
        const newState = { ...prev };
        const post = newState[`${id}`];
        if (!post) return prev;
        post.loadingLike = false;
        return newState;
      });
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      setState((prev) => {
        const newState = { ...prev };
        const post = newState[`${id}`];
        if (!post) return prev;
        post.likedByUser = !post.likedByUser;
        post.likesCount = prev[`${id}`].likedByUser
          ? prev[`${id}`].likesCount - 1
          : prev[`${id}`].likesCount + 1;
        post.loadingLike = false;
        return newState;
      });
    }
  };

  const onPressOptions = (post: Post) => {
    setSelectedPost(post);
    bottomSheetModalOptionsRef.current?.present();
  };

  const renderItem: ListRenderItem<Post> = ({ item: post }) => {
    const key = String(post.id);
    return (
      <PostItem
        key={key}
        post={post}
        onPressComments={() => handlePressComments(post)}
        onPressOptions={() => onPressOptions(post)}
        onPressLike={handlePressLike}
        likedByUser={state[key]?.likedByUser}
        likesCount={state[key]?.likesCount}
        loadingLike={state[key]?.loadingLike}
        commentsCount={state[key]?.commentsCount}
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

  const handlePressCancel = () => {
    bottomSheetModalDeleteRef.current?.close();
    setUnmountOptions(false);
  };

  const handlePressDelete = () => {
    bottomSheetModalDeleteRef.current?.present();
    setUnmountOptions(true);
  };

  const handlePressEdit = () => {
    router.push({ pathname: "/edit-post", params: { id: selectedPost?.id } });
    setUnmountOptions(true);
  };

  const handlePressConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`posts/${selectedPost?.id}`);

      firstLoad();
      handlePressCancel();

      Toast.show({
        type: "success",
        text1: t("chat.postDeleted"),
      });
    } catch (error) {
      console.error("Error deleting post", error);
      Sentry.captureException(error);
    } finally {
      setDeleteLoading(false);
    }
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
            disabled={!(userProfile?.userProfile?.team as Team)?.id}
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
            onEndReached={({ distanceFromEnd }) => {
              if (distanceFromEnd === 0) return;
              loadMoreData();
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={showNoResultsOrErrors}
            ListFooterComponent={dataList.length ? renderSpinner : undefined}
          />
        )}
      </View>
      <View className={Platform.OS === "ios" ? "h-6" : "h-14"}></View>
      <CommentsSheet
        postId={selectedPost?.id}
        bottomSheetModalRef={bottomSheetModalRef}
        updateCommentCount={updateCommentCount}
      />
      {!unmountOptions && (
        <ClosableBottomSheet
          onlyBackdrop
          enablePanDownToClose
          snapPoints={snapPointsOptions}
          bottomSheetModalRef={bottomSheetModalOptionsRef}
        >
          <View className="flex flex-col w-full px-5">
            {selectedPost?.canEditByUser && (
              <ActionItem
                type="edit"
                disabled={deleteLoading}
                title={t("chat.actions.editPost")}
                onPressElement={handlePressEdit}
              />
            )}
            <View className="h-1 border-b border-neutral-200" />
            {selectedPost?.canDeleteByUser && (
              <ActionItem
                disabled={deleteLoading}
                type="delete"
                title={`${t("chat.actions.deletePost")}`}
                onPressElement={handlePressDelete}
              />
            )}
          </View>
        </ClosableBottomSheet>
      )}
      <ClosableBottomSheet
        title={`${t("chat.actions.deletePost")}`}
        snapPoints={snapPointsDelete}
        bottomSheetModalRef={bottomSheetModalDeleteRef}
        onClose={handlePressCancel}
      >
        <View className="flex flex-col w-full px-5">
          <View className="flex items-center justify-center my-6 p-4 rounded-2xl border border-neutral-200">
            <Text className="text-neutral-700 text-center text-base mb-2 w-10/12">
              {t("chat.deletePosttMessage")}
            </Text>
          </View>

          <Button
            disabled={deleteLoading}
            title={t("chat.actions.delete")}
            onPress={handlePressConfirmDelete}
            textClassName="text-white"
            className="bg-red-400 border-red-400 mb-4"
          />
          <Button
            disabled={deleteLoading}
            title={t("chat.actions.cancel")}
            onPress={handlePressCancel}
          />
        </View>
      </ClosableBottomSheet>
    </SafeAreaView>
  );
}
