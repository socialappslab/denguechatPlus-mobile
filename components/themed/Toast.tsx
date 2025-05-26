import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { ToastConfigParams } from "react-native-toast-message";

import { FontFamily } from "@/constants/Styles";
import CheckGreen from "@/assets/images/icons/check-green-circle.svg";
import ErrorRed from "@/assets/images/icons/error-red-circle.svg";

const Toast: React.FC<ToastConfigParams<any>> = ({ type, text1, text2 }) => {
  let backgroundColor: string;
  switch (type) {
    case "success":
      backgroundColor = "#EEFFED";
      break;
    case "error":
      backgroundColor = "#FFC1C1";
      break;
    case "warning":
      backgroundColor = "#FFEF89";
      break;
    default:
      backgroundColor = "#323232";
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View className="mr-2 bg-transparent">
        {type === "success" && <CheckGreen />}
        {type === "error" && <ErrorRed />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.text1}>{text1}</Text>
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create<{
  container: ViewStyle;
  text1: TextStyle;
  text2: TextStyle;
}>({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: "90%",
  },
  text1: {
    color: "#292524",
    fontFamily: FontFamily.medium,
  },
  text2: {
    color: "#44403C",
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
});

export default Toast;
