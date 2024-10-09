import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import useAxios from "axios-hooks";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";

import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { Loading, Text, View } from "@/components/themed";
import { ErrorResponse } from "@/schema";
import { Post } from "@/types";

import CloseCircle from "@/assets/images/icons/close-circle.svg";
import CommentItem from "@/components/segments/CommentItem";

export type CommentsSheetProps = ThemeProps & {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
  postId?: number;
};

export default function CommentsSheet(props: CommentsSheetProps) {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { bottomSheetModalRef, postId, lightColor, darkColor } = props;
  const [post, setPost] = useState<Post | null>(null);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  const [{ data, loading }, refetchPost] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >(
    {
      url: `posts/${postId}`,
    },
    { manual: true },
  );

  useEffect(() => {
    if (isFocused) {
      setLoadingInitial(true);
      setPost(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  useEffect(() => {
    if (!data) return;
    const deserializedData = deserialize<Post>(data);

    let deserializedPost: Post | null = null;
    if (deserializedData && !Array.isArray(deserializedData)) {
      deserializedPost = deserializedData;
    } else if (Array.isArray(deserializedData)) {
      deserializedPost = deserializedData[0];
    }

    if (deserializedPost) {
      deserializedPost.comments = deserializedPost.comments?.map(
        // @ts-ignore
        (item) => item.data.attributes,
      );
      setPost(deserializedPost);
      setLoadingInitial(false);
    }
  }, [data]);

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const shadowColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text",
  );

  const snapPoints = useMemo(() => ["90%"], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        setLoadingInitial(true);
        setPost(null);
      }
      if (index === 0) {
        setLoadingInitial(true);
        setPost(null);
        refetchPost();
      }
    },
    [refetchPost],
  );

  const handleClosePress = () => {
    bottomSheetModalRef.current?.close();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      style={[styles.container, { shadowColor }]}
      keyboardBehavior={Platform.OS === "ios" ? "extend" : "fillParent"}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={[styles.background, { backgroundColor }]}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.5}
          enableTouchThrough={false}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          style={[{ backgroundColor: shadowColor }, StyleSheet.absoluteFill]}
        />
      )}
    >
      <View className="flex flex-row items-center px-5 mb-2">
        <View className="flex flex-1 flex-col">
          <Text className="font-bold text-2xl">{t("chat.comments.title")}</Text>
        </View>
        <TouchableOpacity className="ml-4" onPress={handleClosePress}>
          <CloseCircle />
        </TouchableOpacity>
      </View>

      {!!post?.comments?.length && (
        <BottomSheetScrollView
          style={styles.contentContainer}
          contentContainerStyle={styles.contentContainer}
        >
          {post?.comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onPressDelete={() => {}}
              onPressLike={() => {}}
            />
          ))}
        </BottomSheetScrollView>
      )}

      {(loading || loadingInitial) && (
        <View className="flex flex-1 items-center justify-center">
          <Loading />
        </View>
      )}

      {!post?.comments?.length && !loading && !loadingInitial && (
        <View className="flex flex-1 items-center justify-center">
          <Text className="text-neutral-400 font-bold text-2xl text-center mb-2">
            {t("chat.comments.empty")}
          </Text>
          <Text className="text-neutral-400 text-center text-base mb-2 w-6/12">
            {t("chat.comments.emptyMessage")}
          </Text>
        </View>
      )}

      <View
        className="flex flex-row items-center px-5 pt-2"
        style={{ paddingBottom: insets.bottom }}
      >
        <TouchableOpacity
          onPress={() => {}}
          className={`flex flex-1 flex-row items-center border-neutral-200 border rounded-lg py-2 px-4 h-11`}
        >
          <Text className="text-neutral-300">{t("chat.sharePlaceholder")}</Text>
        </TouchableOpacity>
      </View>
      <View className="h-2" />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  contentContainer: {
    backgroundColor: "transparent",
    width: "100%",
  },
  handleIndicator: {
    width: 0,
    height: 0,
  },
  background: {
    display: "flex",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
