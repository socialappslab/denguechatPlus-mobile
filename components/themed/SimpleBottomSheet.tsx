import React, { useEffect, useMemo, useRef } from "react";

import { StyleSheet, Keyboard, Platform } from "react-native";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import BottomSheet, { BottomSheetProps } from "@gorhom/bottom-sheet";

export type SimpleBottomSheetProps = ThemeProps & BottomSheetProps;

const snapPointsAndroid = ["30%"];
const snapPointsIOS = ["30%", "65%"];

export function SimpleBottomSheet(props: SimpleBottomSheetProps) {
  const { style, lightColor, darkColor, children, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => (Platform.OS === "android" ? snapPointsAndroid : snapPointsIOS),
    [],
  );

  const handleKeyboardHide = () => {
    bottomSheetRef.current?.snapToIndex(0); // Return to the original snap point
  };

  const handleSheetChanges = (index: number) => {
    console.log("handleSheetChanges", index);
    if (index < 0) {
      bottomSheetRef.current?.snapToIndex(0);
    }
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

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      style={[styles.container, style]}
      keyboardBehavior={Platform.OS === "ios" ? "extend" : "fillParent"}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={[styles.background, { backgroundColor }]}
      enableDynamicSizing={false}
      {...otherProps}
    >
      {children}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  handleIndicator: {
    backgroundColor: "#F3F3F3",
    width: 32,
  },
  background: {
    display: "flex",
    borderTopLeftRadius: 28, // Adjust the radius as needed
    borderTopRightRadius: 28, // Adjust the radius as needed
  },
});
