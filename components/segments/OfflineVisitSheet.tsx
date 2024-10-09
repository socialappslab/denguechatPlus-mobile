import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useCallback, useMemo } from "react";
import { Platform, StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { TouchableOpacity } from "react-native-gesture-handler";
import CloseCircle from "@/assets/images/icons/close-circle.svg";
import { useTranslation } from "react-i18next";

interface OfflineVisitSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
}

export const OfflineVisitSheet: React.FC<OfflineVisitSheetProps> = ({
  bottomSheetModalRef,
}) => {
  const { t } = useTranslation();
  const snapPoints = useMemo(() => ["90%"], []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleClosePress = () => {
    bottomSheetModalRef.current?.close();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      style={[styles.container]}
      keyboardBehavior={Platform.OS === "ios" ? "extend" : "fillParent"}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={[styles.background]}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.5}
          enableTouchThrough={false}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          style={[StyleSheet.absoluteFill]}
        />
      )}
    >
      <View className="flex flex-row items-center px-5 mb-2">
        <View className="flex flex-1 flex-col">
          <Text className="font-bold text-2xl">Vista Previa: Casa 1</Text>
        </View>
        <TouchableOpacity className="ml-4" onPress={handleClosePress}>
          <CloseCircle />
        </TouchableOpacity>
      </View>
      <Text>Hola terricolas</Text>
    </BottomSheetModal>
  );
};

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
  scrollContainer: {
    backgroundColor: "green",
  },
  contentContainer: {
    backgroundColor: "transparent",
    width: "100%",
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
  handleIndicator: {
    width: 0,
    height: 0,
  },
  background: {
    display: "flex",
    borderTopLeftRadius: 12, // Adjust the radius as needed
    borderTopRightRadius: 12, // Adjust the radius as needed
  },
});
