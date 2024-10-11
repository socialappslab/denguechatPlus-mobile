import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, TouchableOpacity, Platform, Keyboard } from "react-native";
import { useTranslation } from "react-i18next";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import useAxios from "axios-hooks";
import { Image } from "expo-image";
import { KeyboardAccessoryView } from "react-native-keyboard-accessory";
import { BottomSheetScrollViewMethods } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from "react-hook-form";
import Toast from "react-native-toast-message";

import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { Loading, SimpleTextInput, Text, View } from "@/components/themed";
import { createPostSchema, ErrorResponse, PostInputType } from "@/schema";
import { Post } from "@/types";
import CloseCircle from "@/assets/images/icons/close-circle.svg";
import CommentItem from "@/components/segments/CommentItem";

import { authApi } from "@/config/axios";
import Media from "@/components/icons/Media";
import Send from "@/components/icons/Send";
import DeleteSmall from "@/components/icons/DeleteSmall";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import { Button } from "@/components/themed";

export type CommentsSheetProps = ThemeProps & {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
  postId?: number;
};

type CommentsState = Record<
  number,
  {
    likedByMe: boolean;
    comment: Comment;
    likesCount: number;
    loadingLike: boolean;
  }
>;

export default function CommentsSheet(props: CommentsSheetProps) {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { bottomSheetModalRef, postId, lightColor, darkColor } = props;
  const bottomSheetModalDeleteRef = useRef<BottomSheetModal>(null);

  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [post, setPost] = useState<Post | null>(null);
  const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(
    null,
  );
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  const [postingComment, setPostigComment] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] =
    useState<ImagePicker.ImagePickerAsset>();
  const [loadingPhoto, setLoadingPhoto] = useState<boolean>(false);
  const [numberOfLines, setNumberOfLines] = useState(2);

  const [state, setState] = useState<CommentsState>({});

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

  console.log("CommentsSheet postId:", postId);
  const methods = useForm<PostInputType>({
    resolver: zodResolver(createPostSchema()),
    mode: "onChange",
    defaultValues: { content: "" },
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = methods;

  const watchContent = watch("content", "");

  useEffect(() => {
    setSelectedPhoto(undefined);
    reset({ content: "" });
    setShowOptions(false);
  }, [isFocused, reset]);

  const onSubmitHandler: SubmitHandler<PostInputType> = async (values) => {
    setPostigComment(true);
    const form = new FormData();

    if (selectedPhoto) {
      const trimmedURI =
        Platform.OS === "android"
          ? selectedPhoto.uri
          : selectedPhoto.uri.replace("file://", "");
      const fileName = trimmedURI.split("/").pop();
      const file = {
        uri: selectedPhoto.uri,
        name: fileName,
        type: "image/png",
      };
      form.append("photo", file as any);
    }

    form.append("content", values.content);

    try {
      const response = await authApi.post(`posts/${postId}/comments`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (d) => form,
      });

      console.log("Comment successful:", response.data);

      refetchPost();
      setTimeout(() => {
        setSelectedPhoto(undefined);
        reset({ content: "" });
        setShowOptions(false);
      }, 100);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd();
      }, 1000);
    } catch (error) {
      console.error("Error posting data:", JSON.stringify(error?.response));
      Toast.show({
        type: "error",
        text1: t("errorCodes.generic"),
      });
    } finally {
      setPostigComment(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setLoadingInitial(true);
      setPost(null);
      setState({});
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
      const newState: CommentsState = {};
      deserializedPost.comments?.forEach((item) => {
        // @ts-ignore
        const comment = item.data?.attributes as Commnent;
        newState[comment.id] = {
          likedByMe: comment.likedByMe,
          comment,
          likesCount: comment.likesCount,
          loadingLike: false,
        };
      });

      setState(newState);
      setPost(deserializedPost);
      setLoadingInitial(false);
    }
  }, [data]);

  const handleAddMedia = async () => {
    setLoadingPhoto(true);

    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      console.log(result);

      if (!result.canceled) {
        const resizedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { height: 1024 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.PNG },
        );

        if (resizedImage && resizedImage.uri) {
          setSelectedPhoto(resizedImage);
        } else {
          console.log("Error resizing image");
        }
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    } finally {
      setLoadingPhoto(false);
    }
  };

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
        setState({});
      }
      if (index === 0) {
        setLoadingInitial(true);
        setPost(null);
        setState({});
        refetchPost();
      }
    },
    [refetchPost],
  );

  const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null);

  const handleClosePress = () => {
    bottomSheetModalRef.current?.close();
  };

  const handleRemoveMedia = () => {
    setSelectedPhoto(undefined);
  };

  const checkShowOptions = useCallback(() => {
    if (watchContent.length === 0 && !selectedPhoto) {
      setShowOptions(false);
    } else {
      setShowOptions(true);
    }
  }, [watchContent, selectedPhoto]);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        checkShowOptions();
      },
    );

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setShowOptions(true);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [checkShowOptions]);

  const handlePressCancel = () => {
    bottomSheetModalDeleteRef.current?.close();
  };

  const handlePressDelete = (id: number) => {
    setCommentToDeleteId(id);
    bottomSheetModalDeleteRef.current?.present();
  };

  const handlePressLike = async (id: number) => {
    try {
      setState((prev) => {
        const newState = { ...prev };
        newState[id].likedByMe = !newState[id].likedByMe;
        newState[id].likesCount = prev[id].likedByMe
          ? prev[id].likesCount + 1
          : prev[id].likesCount - 1;
        newState[id].loadingLike = true;
        return newState;
      });
      await authApi.post(`posts/${postId}/comments/${id}/like`);
      console.log("Comment liked:");
      setState((prev) => {
        const newState = { ...prev };
        newState[id].loadingLike = false;
        return newState;
      });
    } catch (error) {
      console.log("Error liking comment", error);
      setState((prev) => {
        const newState = { ...prev };
        newState[id].likedByMe = !newState[id].likedByMe;
        newState[id].likesCount = prev[id].likedByMe
          ? prev[id].likesCount - 1
          : prev[id].likesCount + 1;
        newState[id].loadingLike = false;
        return newState;
      });
    }
  };

  const handlePressConfirmDelete = async () => {
    try {
      setPostigComment(true);
      await authApi.delete(`posts/${postId}/comments/${commentToDeleteId}`);
      console.log("Comment deleted:");
      refetchPost();
      bottomSheetModalDeleteRef.current?.close();
      bottomSheetModalRef.current?.present();
      Toast.show({
        type: "success",
        text1: t("chat.commentDeleted"),
      });
    } catch (error) {
      console.log("Error deleting comment", error);
    } finally {
      setPostigComment(false);
    }
  };

  const snapPointsDelete = useMemo(() => ["45%"], []);

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

      {!!Object.keys(state)?.length && (
        <BottomSheetScrollView
          ref={scrollViewRef}
          style={styles.contentContainer}
          contentContainerStyle={styles.contentContainer}
        >
          {Object.keys(state)?.map((commentId) => (
            <CommentItem
              key={commentId}
              // @ts-ignore
              comment={state[Number(commentId)]?.comment as Comment}
              likedByMe={state[Number(commentId)]?.likedByMe}
              likesCount={state[Number(commentId)]?.likesCount}
              onPressDelete={handlePressDelete}
              onPressLike={handlePressLike}
              loadingLike={state[Number(commentId)]?.loadingLike}
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
      <KeyboardAccessoryView
        alwaysVisible
        heightProperty={showOptions ? "minHeight" : "height"}
        style={[
          {
            backgroundColor,
          },
          !showOptions && {
            borderTopColor: "transparent",
          },
          ,
        ]}
        androidAdjustResize={true}
        animateOn={Platform.OS === "ios" ? "all" : "none"}
      >
        <View
          className={`flex flex-col items-center px-5 ${showOptions ? "pt-5" : "pt-2"}`}
          style={{
            paddingBottom:
              showOptions && Keyboard.isVisible() ? 0 : insets.bottom,
          }}
        >
          <FormProvider {...methods}>
            <View
              className={`w-full px-4 border border-neutral-200 rounded-lg ${Platform.OS === "ios" ? "pb-3 pt-2" : "pb-1 pt-1"}`}
            >
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <SimpleTextInput
                    autoFocus={false}
                    readOnly={loadingPhoto || postingComment}
                    editable={!loadingPhoto && !postingComment}
                    placeholder={t("chat.comments.placeholder")}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    multiline={true}
                    numberOfLines={numberOfLines}
                    onContentSizeChange={(e) => {
                      const contentHeight = e.nativeEvent.contentSize.height;
                      const lineHeight = 20;
                      const calculatedLines = Math.ceil(
                        contentHeight / lineHeight,
                      );
                      const extra = calculatedLines > 2 ? 1 : 0;
                      setNumberOfLines(calculatedLines + extra);
                    }}
                  />
                )}
                name="content"
              />
              {selectedPhoto && (
                <View
                  className="relative inline-flex my-4"
                  style={{ height: 60, width: 60 }}
                >
                  <Image
                    className="relative rounded-lg"
                    source={{ uri: selectedPhoto?.uri }}
                    contentFit="cover"
                    style={{ height: 60, width: 60 }}
                  />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2"
                    onPress={handleRemoveMedia}
                  >
                    <DeleteSmall />
                  </TouchableOpacity>
                </View>
              )}
              {loadingPhoto && (
                <View className="flex items-center justify-center">
                  <Loading />
                </View>
              )}
            </View>

            {/* {errors?.content?.message && !isValid && (
            <View className="w-full mt-2 flex items-start">
              <Text className="font-normal text-red-400 text-xs">
                {errors.content.message}
              </Text>
            </View>
          )} */}
          </FormProvider>
          {showOptions && (
            <View
              className={`flex flex-row items-center justify-between w-full`}
            >
              <TouchableOpacity
                disabled={loadingPhoto || postingComment}
                onPress={handleAddMedia}
                className="pt-4 pb-5 pr-6 pl-4 right-4"
              >
                <Media disabled={loadingPhoto || postingComment} />
              </TouchableOpacity>
              {postingComment && (
                <View
                  className="flex flex-col items-center justify-center"
                  style={{ height: 60 }}
                >
                  <Loading />
                </View>
              )}
              <TouchableOpacity
                disabled={loadingPhoto || !isValid || postingComment}
                onPress={handleSubmit(onSubmitHandler)}
                className="pt-4 pb-5 pl-6 pr-4 left-4"
              >
                <Send disabled={loadingPhoto || !isValid || postingComment} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {(!showOptions || !Keyboard.isVisible()) && (
          <View className={Platform.OS === "ios" ? "h-1" : "h-2"} />
        )}
      </KeyboardAccessoryView>
      <ClosableBottomSheet
        title={t("chat.actions.deleteComment")}
        snapPoints={snapPointsDelete}
        bottomSheetModalRef={bottomSheetModalDeleteRef}
      >
        <View className="flex flex-col w-full px-5">
          <View className="flex items-center justify-center my-6 p-4 rounded-2xl border border-neutral-200">
            <Text className="text-neutral-700 text-center text-base mb-2 w-10/12">
              {t("chat.comments.deleteMessage")}
            </Text>
          </View>

          <Button
            disabled={postingComment}
            title={t("chat.actions.delete")}
            onPress={handlePressConfirmDelete}
            textClassName="text-white"
            className="bg-red-400 border-red-400 mb-4"
          />
          <Button
            disabled={postingComment}
            title={t("chat.actions.cancel")}
            onPress={handlePressCancel}
          />
        </View>
      </ClosableBottomSheet>
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
