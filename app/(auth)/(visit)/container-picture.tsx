import ContainerPictureIllustration from "@/assets/images/container-picture.svg";
import FlipCameraIcon from "@/assets/images/icons/flip-camera.svg";
import Shutter from "@/assets/images/icons/shutter.svg";
import { Button, Loading, SafeAreaView, Text, View } from "@/components/themed";
import {
  CameraCapturedPicture,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";

export default function ContainerPicture() {
  const { t } = useTranslation();
  const { next } = useLocalSearchParams<{ next: string }>();
  const router = useRouter();
  const [photoMode, setPhotoMode] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState<string>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");

  const camera = useRef<CameraView | null>(null);

  const takePicture = async () => {
    if (!cameraReady) return;
    await camera.current?.takePictureAsync({ onPictureSaved: savePicture });
  };

  const flipCamera = useCallback(() => {
    if (facing === "back") return setFacing("front");
    setFacing("back");
  }, [facing, setFacing]);

  const savePicture = async (picture: CameraCapturedPicture) => {
    setPhotoUri(picture.uri);
    setPhotoMode(false);
  };

  const openCamera = () => setPhotoMode(true);

  const onChooseFromGallery = async () => {
    const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!permission.granted)
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    const picture = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
    });
    if (!picture.assets) return;
    const [photoSelected] = picture.assets;
    setPhotoUri(photoSelected.uri);
  };

  // useEffect(() => {
  //   if (permission && !permission.granted) requestPermission();
  // }, [permission, requestPermission]);

  if (!permission) {
    // Camera permissions are still loading.
    return <Loading />;
  }

  if (!permission.granted) {
    requestPermission();
  }

  if (photoMode) {
    return (
      <View>
        <CameraView
          className="h-full w-full flex pb-20 justify-center items-end flex-row"
          facing={facing}
          onCameraReady={() => setCameraReady(true)}
          ref={camera}
        >
          <FlipCameraIcon
            onPress={flipCamera}
            className="absolute left-8 bottom-20"
          />
          <Shutter onPress={takePicture} />
        </CameraView>
      </View>
    );
  }

  const onBack = () => router.back();
  const onNext = () =>
    router.push({
      pathname: "/visit/[questionId]",
      params: { questionId: next },
    });

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        <View className="flex flex-col justify-center items-center flex-1">
          {!photoUri && (
            <View className="h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center">
              <ContainerPictureIllustration width="100%" height="100%" />
            </View>
          )}
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              className={`h-52 w-52 rounded-xl mb-8`}
            />
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
          <Button title={t("back")} onPress={onBack} className="flex-1" />
          <Button
            primary
            title={t("next")}
            onPress={onNext}
            className="flex-1"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
