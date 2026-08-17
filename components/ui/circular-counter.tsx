import { styled } from "nativewind";
import { PropsWithChildren } from "react";
import { View, Text, TextStyle, StyleProp, ViewStyle } from "react-native";

const CircularCounter = styled(function ({
  style,
  children,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View
      style={style}
      className="border-[6px] border-neutral-300 rounded-full w-[70px] h-[70px] justify-center items-center"
    >
      {children}
    </View>
  );
});

const CircularCounterValue = styled(function ({
  style,
  children,
}: {
  style?: StyleProp<TextStyle>;
  children: number;
}) {
  return (
    <Text style={style} className="font-bold text-lg text-neutral-500">
      {children}
    </Text>
  );
});

export { CircularCounter, CircularCounterValue };
