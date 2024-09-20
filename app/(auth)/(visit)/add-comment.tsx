import {
  Button,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "@/components/themed";
import { useVisit } from "@/hooks/useVisit";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const AddComment = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { setVisitData, visitData } = useVisit();
  const [text, setText] = useState(visitData.notes);

  const onNext = () => router.push("summary");
  const onBack = () => router.back();

  const onChangeText = (text: string) => {
    setText(text);
    setVisitData({ notes: text });
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        <View className="flex justify-start flex-1">
          <Text type="title">Agregar comentarios sobre la visita</Text>
          <TextInput
            className="w-full h-32 mt-6 rounded border border-slate-300 text-md p-3"
            multiline
            numberOfLines={4}
            onChangeText={onChangeText}
            value={text}
            placeholder="Escribe tus comentarios"
            keyboardType="default"
          />
          <Text type="small" className="mt-2">
            Los comentarios son opcionales.
          </Text>
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
};

export default AddComment;
