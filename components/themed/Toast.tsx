import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { FontFamily } from "@/constants/Styles";
import CheckGreen from "@/assets/images/icons/check-green-circle.svg";
import ErrorRed from "@/assets/images/icons/error-red-circle.svg";
import { ToastProps } from "@/config/toast";

export default function Toast({ type, text1, text2, props }: ToastProps) {
  function getBackgroundColor(type: string) {
    switch (type) {
      case "success":
        return "#EEFFED";
      case "error":
        return "#FFC1C1";
      case "warning":
        return "#FFEF89";
      default:
        return "#323232";
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: getBackgroundColor(type) }]}
    >
      <View className="mr-2 bg-transparent">
        {type === "success" && <CheckGreen />}
        {type === "error" && <ErrorRed />}
      </View>
      <View style={{ flex: 1 }}>
        {text1 && <Text style={styles.text1}>{text1}</Text>}
        {text2 && <Text style={styles.text2}>{text2}</Text>}
        {props.textNode}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
