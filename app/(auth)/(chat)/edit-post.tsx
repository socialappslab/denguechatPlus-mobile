import { useState, useEffect, useRef, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Toast from "react-native-toast-message";

import {
  useForm,
  Controller,
  SubmitHandler,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFocused } from "@react-navigation/native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import {
  createPostSchema,
  ErrorResponse,
  PostInputType,
  PostVisibility,
  Team,
} from "@/schema";
import { useAuth } from "@/context/AuthProvider";
import {
  Text,
  View,
  SimpleTextInput,
  ScrollView,
  SafeAreaView,
  Loading,
  SelectorButton,
  SelectableItem,
} from "@/components/themed";
import { getInitialsBase } from "@/util";
import { Button } from "@/components/themed";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import Media from "@/components/icons/Media";
import { authApi } from "@/config/axios";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import useAxios from "axios-hooks";
import { Post } from "@/types";

export default function EditPost() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { meData } = useAuth();
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] =
    useState<ImagePicker.ImagePickerAsset>();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const bottomSheetModalVisibilityRef = useRef<BottomSheetModal>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [loadingPhoto, setLoadingPhoto] = useState<boolean>(false);
  const [post, setPost] = useState<Post | null>(null);
  const [numberOfLines, setNumberOfLines] = useState(2);

  const params = useLocalSearchParams();

  const [{ data, loading: loadingPost }] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >({
    url: `posts/${params?.id}`,
  });

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
      setPost(deserializedPost);
      console.log("deserializedPost>>>>>", deserializedPost);
    }
  }, [data]);

  const methods = useForm<PostInputType>({
    resolver: zodResolver(createPostSchema()),
    mode: "onChange",
    defaultValues: { content: "" },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = methods;

  useEffect(() => {
    setSelectedPhoto(undefined);
    reset({ content: "" });
  }, [isFocused, reset]);

  useEffect(() => {
    if (post) {
      reset({ content: post.content });
      setVisibility(post.visibility);
    }
  }, [post, reset]);

  const onBack = () => {
    router.back();
  };

  const onSubmitHandler: SubmitHandler<PostInputType> = async (values) => {
    setLoading(true);
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

      // const fileBlob = await (await fetch(selectedPhoto.uri)).blob();
      form.append("photos[]", file as any);
    }

    form.append("content", values.content);
    form.append("visibility", visibility);
    // form.append("delete_photo", "false");

    try {
      const response = await authApi.put(`posts/${post?.id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (d) => form,
      });

      console.log("Post Update successful:", response.data);
      Toast.show({
        type: "success",
        text1: t("chat.postUpdated"),
      });
      setTimeout(() => {
        router.back();
      }, 200);
    } catch (error) {
      console.error("Error posting data:", JSON.stringify(error?.response));
      Toast.show({
        type: "error",
        text1: t("errorCodes.generic"),
      });
    } finally {
      setLoading(false);
    }
  };

  const snapPoints = useMemo(() => ["45%"], []);

  const handlePressDelete = () => {
    bottomSheetModalRef.current?.present();
  };

  const handlePressCancel = () => {
    bottomSheetModalRef.current?.close();
  };

  const handlePressVisibility = () => {
    bottomSheetModalVisibilityRef.current?.present();
  };

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
          console.log("Image successfully resized!");
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

  const initials = getInitialsBase(
    String(meData?.userProfile?.firstName),
    String(meData?.userProfile?.lastName),
  );

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        {!loading && !loadingPost && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View className="flex flex-row items-center mb-4">
                <View
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-green-400 mr-3`}
                >
                  <Text className="font-bold text-sm text-green-700">
                    {initials}
                  </Text>
                </View>
                <View className="flex flex-1 flex-col">
                  <Text className="font-semibold">{`${meData?.userProfile?.firstName} ${meData?.userProfile?.lastName}`}</Text>
                  <Text className={`text-sm opacity-60`}>
                    {(meData?.userProfile?.team as Team)?.sector_name}
                  </Text>
                </View>

                <SelectorButton
                  className="mr-4"
                  disabled={loadingPhoto}
                  label={
                    visibility === "public"
                      ? t("chat.visibility.all")
                      : t("chat.visibility.myBrigade")
                  }
                  onPress={handlePressVisibility}
                  iconMaterial={
                    visibility === "public" ? "earth" : "account-group-outline"
                  }
                />

                <TouchableOpacity
                  disabled={loadingPhoto}
                  onPress={handleAddMedia}
                >
                  <Media disabled={loadingPhoto} />
                </TouchableOpacity>
              </View>

              <FormProvider {...methods}>
                <View className="mb-4">
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <SimpleTextInput
                        className="border-0 p-0"
                        placeholder={t("chat.sharePlaceholder")}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        multiline={true}
                        numberOfLines={numberOfLines}
                        onContentSizeChange={(e) =>
                          setNumberOfLines(
                            Math.max(
                              2,
                              Math.floor(e.nativeEvent.contentSize.height / 20),
                            ),
                          )
                        }
                        style={{ textAlignVertical: "top" }}
                      />
                    )}
                    name="content"
                  />
                  {errors?.content?.message && !isValid && (
                    <Text className="font-normal text-red-400 text-xs mb-2 mt-1">
                      {errors.content.message}
                    </Text>
                  )}
                </View>
              </FormProvider>
              {(selectedPhoto || post?.photoUrl !== null) && (
                <Image
                  className="rounded-lg mb-4"
                  contentFit="contain"
                  source={{
                    uri: selectedPhoto?.uri ?? post?.photoUrl?.photo_url,
                  }}
                  style={{ height: 210 }}
                />
              )}
              {loadingPhoto && (
                <View
                  className="flex items-center justify-center"
                  style={{ height: 210 }}
                >
                  <Loading />
                </View>
              )}
            </ScrollView>
            <View className="flex flex-row gap-2">
              <View className="flex-1">
                <Button title={t("chat.actions.cancel")} onPress={onBack} />
              </View>
              <View className="flex-1">
                <Button
                  primary
                  disabled={!isValid}
                  title={t("chat.actions.save")}
                  onPress={handleSubmit(onSubmitHandler)}
                />
              </View>
            </View>
          </>
        )}

        {(loading || loadingPost) && (
          <View className="flex flex-1 items-center justify-center">
            <Loading />
          </View>
        )}

        <ClosableBottomSheet
          title={t("chat.visibility.title")}
          bottomSheetModalRef={bottomSheetModalVisibilityRef}
        >
          <View className="flex flex-col w-full px-5">
            <SelectableItem
              checked={visibility === "public"}
              onValueChange={() => {
                setVisibility("public");
                bottomSheetModalVisibilityRef.current?.close();
              }}
              label={t("chat.visibility.all")}
            />
            <SelectableItem
              checked={visibility === "team"}
              onValueChange={() => {
                setVisibility("team");
                bottomSheetModalVisibilityRef.current?.close();
              }}
              label={t("chat.visibility.myBrigade")}
            />
          </View>
        </ClosableBottomSheet>
      </View>
    </SafeAreaView>
  );
}
