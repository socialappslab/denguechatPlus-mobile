import { Checkbox, RadioButton, Text, View } from "@/components/themed";
import { CheckboxProps } from "@/types/CheckboxProps";
import { Controller, FieldValues, UseFormReturn } from "react-hook-form";
import { TouchableOpacity } from "react-native";

interface CheckboxOption {
  value: number;
  label: string;
  required?: boolean;
}

interface CustomCheckboxProps extends CheckboxProps {
  name: number;
  options: CheckboxOption[];
  type: "radio" | "checkbox";
  methods: UseFormReturn<FieldValues, any, undefined>;
}

export const SelectableList = ({
  name,
  options,
  value,
  methods,
  type = "checkbox",
  ...rest
}: CustomCheckboxProps) => {
  return options.map((option) => {
    const inputName = `question_${name}[option_${option.value}]`;
    return (
      <>
        {type === "checkbox" && (
          <Controller
            name={inputName}
            control={methods.control}
            rules={{
              required: option.required ? "This field is required" : false,
            }}
            render={({ field: { onChange, value } }) => {
              return (
                <TouchableOpacity
                  className={`flex flex-row gap-2 p-2 pb-4 mb-5 rounded-md ${value ? "bg-green-400" : "bg-gray-400"}`}
                  onPress={onChange}
                >
                  <Checkbox
                    {...rest}
                    value={value}
                    className="bg-white"
                    onValueChange={onChange}
                  />
                  <Text className="text-sky-400 font-medium text-sm/[17px]">
                    {option.label}
                    {option.required && "*"}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
        {/* uses setValue and watch to manage radio buttons */}
        {type === "radio" && (
          <Controller
            name={inputName}
            control={methods.control}
            rules={{
              required: option.required ? "This field is required" : false,
            }}
            render={() => {
              const isSelected = !!methods.watch(inputName);
              const onChange = () => {
                let prev = methods.getValues(`question_${name}`);
                Object.keys(prev).map((key) => (prev[key] = false));
                methods.setValue(`question_${name}`, prev);
                methods.setValue(inputName, true);
              };
              return (
                <TouchableOpacity
                  onPress={onChange}
                  className={`flex flex-row gap-2 p-2 pb-4 mb-5 rounded-md ${isSelected ? "bg-green-400" : "bg-gray-400"}`}
                >
                  <RadioButton
                    {...rest}
                    value={isSelected}
                    className="bg-white"
                    onValueChange={onChange}
                  />
                  <Text className="text-sky-400 font-medium text-sm/[17px]">
                    {option.label}
                    {option.required && "*"}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </>
    );
  });
};
