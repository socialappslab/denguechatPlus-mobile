import { useState } from "react";

import { TextInput as DefaultTextInput, View, Pressable } from "react-native";
import { FontFamily } from "@/constants/Styles";

import { useThemeColor } from "@/components/themed/useThemeColor";
import { TextInputProps } from "@/components/themed/TextInput";
import Eye from "@/assets/images/icons/eye.svg";

export function PasswordInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const color = useThemeColor({ dark: lightColor, light: darkColor }, "text");

  const [passwordVisible, setPasswordVisible] = useState(true);

  const onChangeVisibility = () => {
    setPasswordVisible((lastState) => !lastState);
  };

  return (
    <View className="border border-gray-500 rounded-lg p-3 flex flex-row items-center h-11">
      <DefaultTextInput
        secureTextEntry={passwordVisible}
        style={[
          { backgroundColor, color, fontFamily: FontFamily.regular },
          style,
        ]}
        className="flex-grow flex-1 border-0"
        {...otherProps}
      />
      <Pressable onPress={onChangeVisibility} className="-mr-px">
        <Eye />
      </Pressable>
    </View>
  );
}
