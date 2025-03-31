import RNPickerSelect from "react-native-picker-select";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

type Props<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  required?: boolean;
  options: {
    value: string;
    label: string;
  }[];
};

export function PickerInput<T extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  disabled,

  label,
  required,
  options,
}: Props<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    rules,
    shouldUnregister,
    defaultValue,
    control,
    disabled,
  });
  const { t } = useTranslation();

  return (
    <View>
      {label && (
        <Text className="font-medium text-sm mb-2">
          {label} {required && "*"}
        </Text>
      )}

      <RNPickerSelect
        items={options}
        onValueChange={(value) => {
          field.onChange(value);
        }}
        placeholder={{ label: t("selectOption"), value: null }}
        value={field.value}
        disabled={disabled}
        style={{
          inputAndroid: {
            borderWidth: 1,
            // NOTE: same as `text-red-500` and `border-neutral-200` class
            borderColor: error ? "#ff2626" : "#e7e5e4",
            padding: 8,
            height: 44,
            borderRadius: 8,
          },
          inputIOSContainer: {
            justifyContent: "center",
            paddingHorizontal: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: error ? "#ff2626" : "#e7e5e4",
            height: 44,
          },
          iconContainer: {
            top: "50%",
            transform: [{ translateY: -12 }],
            right: 6,
          },
        }}
        useNativeAndroidPickerStyle={false}
        Icon={() => (
          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color="#e7e5e4"
          />
        )}
        doneText={t("done")}
      />

      {error?.message && (
        <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
      )}
    </View>
  );
}
