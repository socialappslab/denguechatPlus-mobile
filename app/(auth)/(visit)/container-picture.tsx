import ContainerPictureIllustration from "@/assets/images/container-picture.svg";
import FlipCameraIcon from "@/assets/images/icons/flip-camera.svg";
import ShutterIcon from "@/assets/images/icons/shutter.svg";
import { Button, Loading, SafeAreaView, Text } from "@/components/themed";
import {
  CameraCapturedPicture,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";
import { useInspectionPhotos } from "@/hooks/useInspectionPhotos";

export default function ContainerPicture() {
  const { t } = useTranslation();
  const { next } = useLocalSearchParams<{ next: string }>();
  const router = useRouter();
  const { attachPhotoToCurrentInspection } = useInspectionPhotos();

  const [photoMode, setPhotoMode] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState<string>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");

  const camera = useRef<CameraView | null>(null);

  async function takePicture() {
    if (!cameraReady) return;
    await camera.current?.takePictureAsync({ onPictureSaved: savePicture });
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function savePicture(picture: CameraCapturedPicture) {
    setPhotoUri(picture.uri);
    setPhotoMode(false);
  }

  const openCamera = () => setPhotoMode(true);

  async function onChooseFromGallery() {
    const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!permission.granted)
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    const picture = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
    });
    if (!picture.assets) return;
    const [photoSelected] = picture.assets;
    setPhotoUri(photoSelected.uri);
  }

  async function handleNext() {
    if (photoUri) await attachPhotoToCurrentInspection(photoUri);

    router.push({
      pathname: "/visit/[questionId]",
      params: { questionId: next },
    });
  }

  if (!permission) return <Loading />;

  if (!permission.granted) void requestPermission();

  if (photoMode) {
    return (
      <View className="relative">
        <CameraView
          className="h-full w-full flex pb-20 justify-center items-end flex-row"
          facing={facing}
          mode="picture"
          onCameraReady={() => setCameraReady(true)}
          ref={camera}
        />
        <View className="absolute bottom-16 px-8 flex-row items-center w-full">
          <View className="w-1/3">
            <FlipCameraIcon onPress={toggleCameraFacing} />
          </View>
          <View className="w-1/3 items-center">
            <ShutterIcon onPress={takePicture} />
          </View>
          <View className="w-1/3" />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["right", "bottom", "left"]}>
      <View className="flex flex-1 py-5 px-5 h-full">
        <View className="flex flex-col justify-center items-center flex-1">
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              className={`h-52 w-52 rounded-xl mb-8`}
            />
          ) : (
            <View className="h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center">
              <ContainerPictureIllustration width="100%" height="100%" />
            </View>
          )}
          <Text type="title" className="text-center">
            {t("visit.containerPicture.title")}
          </Text>
          <Text
            type="text"
            className="text-center p-8 pt-4 whitespace-pre-wrap"
          >
            {t("visit.containerPicture.description")}
          </Text>
          <Button
            title={t("visit.containerPicture.takePhoto")}
            onPress={openCamera}
            className="bg-green-300 border-transparent shadow-sm shadow-green-300 mb-4 "
          />
          <Button
            title={t("visit.containerPicture.chooseFromGallery")}
            onPress={onChooseFromGallery}
            className="bg-white border-transparent"
          />
        </View>

        <View className="flex flex-row gap-2">
          <Button
            title={t("back")}
            onPress={() => {
              router.back();
            }}
            className="flex-1"
          />
          <Button
            primary
            title={t("next")}
            onPress={async () => {
              await handleNext();
            }}
            className="flex-1"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
