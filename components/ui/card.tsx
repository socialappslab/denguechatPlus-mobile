import { styled } from "nativewind";
import { PropsWithChildren } from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

const Card = styled(function ({
  style,
  children,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={style} className="border border-neutral-200 rounded-lg">
      {children}
    </View>
  );
});

const CardHeader = styled(function ({
  style,
  children,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    // TODO: add some styles, check shadcn
    <View style={style} className="px-4 pt-2">
      {children}
    </View>
  );
});

const CardTitle = styled(function ({
  style,
  children,
}: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) {
  return (
    <Text style={style} className="font-semibold leading-none">
      {children}
    </Text>
  );
});

const CardContent = styled(function ({
  style,
  children,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={style} className="px-4 py-2">
      {children}
    </View>
  );
});

export { Card, CardContent, CardHeader, CardTitle };
