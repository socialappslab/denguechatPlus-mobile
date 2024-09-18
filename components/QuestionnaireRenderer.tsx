import { SelectableItem, Text, View } from "@/components/themed";
import { InspectionQuestion, OptionType } from "@/types";
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

export interface CheckboxOption {
  value: string | number;
  label: string;
  required?: boolean;
  image?: string;
  resourceName?: string;
  resourceId?: string;
  next?: number;
  optionType: OptionType;
}
interface QuestionnaireRendererProps {
  question: InspectionQuestion;
  methods: UseFormReturn<FieldValues, any, undefined>;
}

export interface FormStateOption {
  value: string;
  resourceName: string;
  resourceId: string;
  next?: number;
  text?: string;
}

const prepareOption = ({
  option: { value, resourceName, resourceId, next },
  text,
}: {
  option: CheckboxOption;
  text?: string;
}) => ({
  value,
  resourceName,
  resourceId,
  next,
  text,
});

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
      value: option.id,
      label: option.name,
      required: option.required,
      image: option.image,
      resourceName: question.resourceName,
      resourceId: option.resourceId,
      next: option.next,
      optionType: option.optionType,
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
          {formattedOptions
            .sort(
              (a, b) =>
                parseInt(a.value as string) - parseInt(b.value as string),
            )
            .map((option) => {
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

  const onChange = (text: string) => {
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
      const valuesToSave = [...values, prepareOption({ option, text })];

      setValue(name, valuesToSave);
      setItemsChecked(valuesToSave);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={() => {
        return (
          <SelectableItem
            value={`${option.value}`}
            checked={isSelected}
            className="bg-white"
            onValueChange={onChange}
            label={option.label}
            required={!!option.required}
            optionType={option.optionType}
            type="checkbox"
            image={option.image}
            defaultText={isSelected.text}
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
  console.log(getValues(name));
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: option.required ? "This field is required" : false,
      }}
      render={() => {
        const isSelected = getValues(name)?.value === option.value;
        const onChange = (text: string) => {
          setValue(name, prepareOption({ option, text }));
        };
        return (
          <SelectableItem
            value={`${option.value}`}
            checked={isSelected}
            className="bg-white"
            onValueChange={onChange}
            label={option.label}
            required={!!option.required}
            optionType={option.optionType}
            image={option.image}
            defaultText={getValues(name)?.text}
          />
        );
      }}
    />
  );
};

export default QuestionnaireRenderer;
