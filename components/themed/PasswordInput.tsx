import { useState } from "react";

import { TextInput as DefaultTextInput, View, Pressable } from "react-native";
import { FontFamily } from "@/constants/Styles";

import { useThemeColor } from "@/components/themed/useThemeColor";
import { TextInputProps } from "@/components/themed/TextInput";

import Eye from "@/assets/images/icons/eye.svg";
import EyeOff from "@/assets/images/icons/eye-off.svg";

export function PasswordInput(props: TextInputProps) {
  const { style, lightColor, darkColor, hasError, inputRef, ...otherProps } =
    props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const color = useThemeColor({ dark: lightColor, light: darkColor }, "text");

  const [passwordVisible, setPasswordVisible] = useState<boolean>(true);

  const onChangeVisibility = () => {
    setPasswordVisible((lastState) => !lastState);
  };

  return (
    <View
      className={`${hasError ? "border-red-500" : "border-neutral-200"} border rounded-lg flex-row items-center h-11 p-2 bg-white`}
    >
      <DefaultTextInput
        ref={inputRef}
        secureTextEntry={passwordVisible}
        style={[
          {
            backgroundColor,
            color,
            fontFamily: FontFamily.regular,
          },
          style,
        ]}
        // Adding p-0 due to a height problem after migrating to SDK 53
        // https://github.com/facebook/react-native/issues/36861#issuecomment-3041795703
        className="flex-grow border-0 p-0"
        autoCapitalize="none"
        autoCorrect={false}
        {...otherProps}
      />
      <Pressable onPress={onChangeVisibility} className="-mr-px">
        {passwordVisible ? <Eye /> : <EyeOff />}
      </Pressable>
    </View>
  );
}
