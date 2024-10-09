import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetProps,
} from "@gorhom/bottom-sheet";
import { StyleSheet, Keyboard, Platform, TouchableOpacity } from "react-native";

import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";

import { View, Text } from "@/components/themed";
import CloseCircle from "@/assets/images/icons/close-circle.svg";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ClosableBottomSheetProps = ThemeProps &
  BottomSheetProps & {
    bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
    title: string;
    onClose?: () => void;
  };

export function ClosableBottomSheet(props: ClosableBottomSheetProps) {
  const {
    style,
    title,
    onClose,
    lightColor,
    darkColor,
    children,
    bottomSheetModalRef,
    ...otherProps
  } = props;
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const shadowColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text",
  );

  const handleKeyboardHide = () => {
    bottomSheetModalRef.current?.snapToIndex(0); // Return to the original snap point
  };

  const snapPoints = useMemo(() => ["30%"], []);

  const handleSheetChanges = (index: number) => {
    if (index === -1 && onClose) {
      onClose();
    }
    if (index === 0) {
      Keyboard.dismiss();
    }
    setCurrentIndex(index);
  };

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      handleKeyboardHide,
    );

    return () => {
      keyboardDidHideListener.remove();
    };
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
      {...otherProps}
    >
      <View className="flex flex-row items-center px-5 mb-2">
        <View className="flex flex-1 flex-col">
          <Text className="font-bold text-2xl">{title}</Text>
        </View>
        <TouchableOpacity className="ml-4" onPress={handleClosePress}>
          <CloseCircle />
        </TouchableOpacity>
      </View>

      <View
        key={currentIndex}
        className="flex flex-1 flex-row items-center"
        style={{ paddingBottom: insets.bottom }}
      >
        {/* @ts-ignore */}
        {children}
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
