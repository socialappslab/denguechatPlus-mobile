import {
  Button,
  SafeAreaView,
  ScrollView,
  SelectableItem,
  Text,
  View,
} from "@/components/themed";
import { useVisitStore } from "@/hooks/useVisitStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Routes } from "./_layout";

enum Selection {
  Yes,
  No,
}

const AddContainer = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<Selection | undefined>();
  const { increaseCurrentVisitInspection } = useVisitStore();

  const onNext = () => {
    if (selected === Selection.No) return router.push(Routes.AddComment);

    // If yes increase inspectionIdx
    if (selected === Selection.Yes) increaseCurrentVisitInspection();
    return router.push("visit/10");
  };

  const onBack = () => router.back();

  const onAddContainer = () => {
    setSelected(Selection.Yes);
  };

  const onContinueWithoutNewContainer = () => {
    setSelected(Selection.No);
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        <View className="flex justify-start flex-1">
          {/* Wrapped in scroll view to hid the keyboard */}
          <ScrollView>
            <Text type="title" className="mb-8">
              Registrar otro contenedor?
            </Text>

            <SelectableItem
              checked={selected === Selection.Yes}
              onValueChange={onAddContainer}
              label="Sí, registrar otro contenedor"
            />
            <SelectableItem
              checked={selected === Selection.No}
              onValueChange={onContinueWithoutNewContainer}
              label="No, no es necesario"
            />
          </ScrollView>
        </View>
        <View className="flex flex-row gap-2">
          <Button title={t("back")} onPress={onBack} className="flex-1" />
          <Button
            primary
            title={t("next")}
            onPress={onNext}
            className="flex-1"
            disabled={selected === undefined}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddContainer;
