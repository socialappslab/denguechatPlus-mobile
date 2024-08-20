import { Checkbox, Text } from "@/components/themed";
import { CheckboxProps } from "@/types/CheckboxProps";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

interface CheckboxOption {
  value: string;
  label: string;
}

interface CustomCheckboxProps extends CheckboxProps {
  options: CheckboxOption[];
}

export const CheckboxList = ({
  options,
  value,
  ...rest
}: CustomCheckboxProps) => {
  const [values, setValues] = useState<string[]>([]);

  return options.map((option) => {
    const isChecked = values.includes(option.value);
    const onChange = () =>
      setValues((prev) =>
        prev.includes(option.value)
          ? prev.filter((value) => value !== option.value)
          : [...prev, option.value],
      );
    return (
      <TouchableOpacity
        className={`flex flex-row gap-2 p-2 pb-4 mb-5 rounded-md ${isChecked ? "bg-green-400" : "bg-gray-400"}`}
        onPress={onChange}
        activeOpacity={0.5}
      >
        <Checkbox
          {...rest}
          value={isChecked}
          className="bg-white"
          onValueChange={onChange}
        />
        <Text className="text-sky-400 font-medium text-sm/[17px]">
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  });
};
