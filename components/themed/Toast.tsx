import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { FontFamily } from "../../constants/Styles";
import { ToastConfigParams } from "react-native-toast-message";

const Toast: React.FC<ToastConfigParams<any>> = ({ type, text1, text2 }) => {
  let backgroundColor: string;
  switch (type) {
    case "success":
      backgroundColor = "#04BF00";
      break;
    case "error":
      backgroundColor = "#FC0606";
      break;
    case "warning":
      backgroundColor = "#FCC914";
      break;
    default:
      backgroundColor = "#323232"; // Default color
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text1}>{text1}</Text>
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  );
};

const styles = StyleSheet.create<{
  container: ViewStyle;
  text1: TextStyle;
  text2: TextStyle;
}>({
  container: {
    opacity: 0.9,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 4,
    width: "80%",
    alignSelf: "center",
  },
  text1: {
    color: "#FFF",
    textAlign: "center",
    fontFamily: FontFamily.medium,
  },
  text2: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
});

export default Toast;
