import { Checkbox, RadioButton, Text, View } from "@/components/themed";
import { InspectionQuestion } from "@/types";
import { useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  FormProvider,
  UseFormGetValues,
  UseFormReturn,
  UseFormSetValue,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

interface CheckboxOption {
  value: string | number;
  label: string;
  required?: boolean;
  image: string;
  resourceName?: string;
  resourceId?: string;
}
interface QuestionnaireRendererProps {
  question: InspectionQuestion;
  methods: UseFormReturn<FieldValues, any, undefined>;
}

const optionsToCheckboxOption = (options?: Option[]) => {
  if (!options) return [];
  return options.map((option) => ({
    value: option.value || option.id,
    label: option.name,
    required: option.required,
    textArea: option.textArea,
  }));
};

const QuestionnaireRenderer = ({
  question,
  methods,
}: QuestionnaireRendererProps) => {
  const { t } = useTranslation();
  const options = question.options;
  const hasRequiredOptions = question?.options?.some((o) => o.required);
  const { control, getValues, setValue } = methods;

  const formattedOptions: CheckboxOption[] =
    options?.map((option) => ({
      value: option.resourceId || option.id,
      label: option.name,
      required: option.required,
      image: "",
      resourceName: question.resourceName,
      resourceId: option.resourceId,
    })) || [];

  const name = String(question.id);

  return (
    <FormProvider {...methods}>
      {question.typeField === "splash" && (
        <View className="flex flex-col justify-center items-center h-full">
          <View className="bg-green-300 h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center">
            <Text className="text-center text">Ilustración o ícono</Text>
          </View>
          <Text type="title" className="text-center">
            {question.question}
          </Text>
          <Text
            type="text"
            className="text-center p-8 pt-4 whitespace-pre-wrap"
          >
            {question.description?.replace(/\\n/g, "\n")}
          </Text>
        </View>
      )}
      {question.typeField !== "splash" && (
        <View>
          <Text type="title" className="mb-8">
            {question.question}
          </Text>
          {formattedOptions.map((option) => {
            return (
              option && (
                <>
                  {question.typeField === "multiple" && (
                    <ControlledCheckbox
                      setValue={setValue}
                      getValues={getValues}
                      name={name}
                      control={control}
                      option={option}
                    />
                  )}
                  {question.typeField === "list" && (
                    <ControlledList
                      getValues={getValues}
                      setValue={setValue}
                      name={name}
                      control={control}
                      option={option}
                    />
                  )}
                </>
              )
            );
          })}
          <Text type="small">{hasRequiredOptions && t("visit.required")}</Text>
        </View>
      )}
    </FormProvider>
  );
};

const ControlledCheckbox = ({
  name,
  control,
  option,
  getValues,
  setValue,
}: {
  name: string;
  control: Control<FieldValues>;
  option: CheckboxOption;
  setValue: UseFormSetValue<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
}) => {
  const [itemsChecked, setItemsChecked] = useState(getValues(name) || []);
  const isSelected = itemsChecked.some(
    (item: CheckboxOption) => item.value === option.value,
  );

  const onChange = () => {
    let values = getValues(name);
    if (!values) {
      values = [];
    }

    const indexFound = values.findIndex(
      (item: CheckboxOption) => item.value === option.value,
    );

    if (indexFound > -1) {
      const valuesToSave = values.filter(
        (item: CheckboxOption) => item.value !== option.value,
      );
      setValue(name, valuesToSave);
      setItemsChecked(valuesToSave);
    } else {
      const valuesToSave = [...values, option];
      setValue(name, valuesToSave);
      setItemsChecked(valuesToSave);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: option.required ? "This field is required" : false,
      }}
      render={() => {
        return (
          <Checkbox
            value={isSelected}
            className="bg-white"
            onValueChange={onChange}
            label={option.label}
            required={!!option.required}
            // image={option.image}
          />
        );
      }}
    />
  );
};

const ControlledList = ({
  name,
  option,
  control,
  setValue,
  getValues,
}: {
  name: string;
  option: CheckboxOption;
  control: Control<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: option.required ? "This field is required" : false,
      }}
      render={() => {
        const isSelected = getValues(name)?.value === option.value;
        const onChange = () => {
          setValue(name, option);
        };
        return (
          <RadioButton
            value={isSelected}
            className="bg-white"
            onValueChange={onChange}
            label={option.label}
            required={!!option.required}
            // image={option.image}
          />
        );
      }}
    />
  );
};

export default QuestionnaireRenderer;
