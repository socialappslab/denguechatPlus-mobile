import { Checkbox, RadioButton } from "@/components/themed";
import { CheckboxProps } from "@/types/CheckboxProps";
import { Controller, FieldValues, UseFormReturn } from "react-hook-form";

interface CheckboxOption {
  value: number;
  label: string;
  required?: boolean;
  image: string;
}

interface CustomCheckboxProps extends CheckboxProps {
  name: string | number;
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
                <Checkbox
                  {...rest}
                  value={value}
                  className="bg-white"
                  onValueChange={onChange}
                  label={option.label}
                  required={!!option.required}
                  image={option.image}
                />
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
                <RadioButton
                  {...rest}
                  value={isSelected}
                  className="bg-white"
                  onValueChange={onChange}
                  label={option.label}
                  required={!!option.required}
                  image={option.image}
                />
              );
            }}
          />
        )}
      </>
    );
  });
};
