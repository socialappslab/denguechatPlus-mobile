import { TextInput as DefaultTextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRef } from "react";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { FontFamily } from "@/constants/Styles";
import { IconMaterial, View } from "@/components/themed";
import Clear from "@/assets/images/icons/clear.svg";

export type TextInputProps = ThemeProps &
  DefaultTextInput["props"] & {
    inputRef?: React.RefObject<DefaultTextInput>;
    search?: boolean;
    onClear?: () => void;
    isSheet?: boolean;
    iconMaterial?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  };

export function TextInput(props: TextInputProps) {
  const {
    style,
    readOnly,
    lightColor,
    darkColor,
    hasError,
    search,
    inputRef,
    value,
    isSheet,
    iconMaterial,
    onClear,
    ...otherProps
  } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const color = useThemeColor({ dark: lightColor, light: darkColor }, "text");
  const inputRefSearch = useRef<DefaultTextInput>(null);

  const clearText = () => {
    if (inputRefSearch.current) {
      inputRefSearch.current.clear();
    }
    if (onClear) {
      onClear();
    }
  };

  const classNameBorder = `${hasError ? "border-red-500" : "border-neutral-200"} ${readOnly ? "bg-neutral-50 opacity-60" : ""}  border rounded-lg p-2 h-11`;
  const styleInput = { backgroundColor, color, fontFamily: FontFamily.regular };

  if (!search && !iconMaterial) {
    if (isSheet) {
      return (
        <View className={`flex flex-row items-center ${classNameBorder}`}>
          <BottomSheetTextInput
            value={value}
            style={[
              styleInput,
              {
                marginLeft: 4,
                display: "flex",
                flex: 1,
              },
              style,
            ]}
            className={classNameBorder}
            {...otherProps}
          />
        </View>
      );
    }

    return (
      <DefaultTextInput
        ref={inputRef}
        value={value}
        style={[styleInput, style]}
        className={classNameBorder}
        {...otherProps}
      />
    );
  } else {
    return (
      <View className={`flex flex-row items-center ${classNameBorder}`}>
        {search && <Feather name="search" size={20} color="#A9A29D" />}
        {iconMaterial && <IconMaterial size={24} name={iconMaterial} />}
        {!isSheet && (
          <DefaultTextInput
            ref={inputRefSearch}
            value={value}
            style={[
              styleInput,
              {
                marginLeft: 4,
                display: "flex",
                flex: 1,
              },
              style,
            ]}
            {...otherProps}
          />
        )}
        {isSheet && (
          <BottomSheetTextInput
            value={value}
            style={[
              styleInput,
              {
                marginLeft: 4,
                display: "flex",
                flex: 1,
              },
              style,
            ]}
            {...otherProps}
          />
        )}

        {value && search && !isSheet && (
          <TouchableOpacity onPress={clearText}>
            <Clear />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
