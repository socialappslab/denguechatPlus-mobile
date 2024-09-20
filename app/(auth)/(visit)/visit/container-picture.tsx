import { Button, SafeAreaView, Text, View } from "@/components/themed";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ContainerPicture() {
  const { t } = useTranslation();
  const router = useRouter();
  const [photoMode, setPhotoMode] = useState(false);
  const takePhoto = () => setPhotoMode(true);
  const [permission, requestPermission] = useCameraPermissions();

  // useEffect(() => {
  //   if (permission && !permission.granted) requestPermission();
  // }, [permission, requestPermission]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  if (photoMode) {
    return (
      <View>
        <CameraView className="h-full w-full" facing={"back"}></CameraView>
      </View>
    );
  }

  const onBack = () => router.back();
  const onNext = () => {};

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        <View className="flex flex-col justify-center items-center flex-1">
          <View className="bg-green-300 h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center">
            <Text className="text-center text">Ilustración o ícono</Text>
          </View>
          <Text type="title" className="text-center">
            Foto del contenedor
          </Text>
          <Text
            type="text"
            className="text-center p-8 pt-4 whitespace-pre-wrap"
          >
            Toma una fotografía del contenedor y regístrala
          </Text>
          <Button
            primary
            className="w-1/2 mt-6"
            title="Take photo"
            onPress={() => takePhoto()}
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
