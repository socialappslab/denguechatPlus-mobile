import { SelectableItem, Text, View } from "@/components/themed";
import { InspectionQuestion, OptionType, ResourceType } from "@/types";
import React, { useCallback, useState } from "react";
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

/** Interfaces */
interface QuestionnaireRendererProps {
  question: InspectionQuestion;
  methods: UseFormReturn<FieldValues, any, undefined>;
  name: string;
  currentValues: any;
}

export interface ISelectableItem {
  value: string | number;
  label: string;
  required?: boolean;
  image?: string;
  resourceName?: string;
  resourceId?: string;
  next?: number;
  optionType?: OptionType;
  group?: string;
  text?: string;
  resourceType?: ResourceType;
  statusColor?: string;
  disableOtherOptions?: boolean;
  bool?: boolean;
}

/** Utils */
// Prepare for ISeletableItems and order
const formatOptionsForSelectableItems = ({
  resourceName,
  resourceType,
  options,
}: InspectionQuestion): ISelectableItem[] =>
  options
    ?.map(
      ({
        id,
        name,
        optionType,
        next,
        resourceId,
        image,
        required,
        group,
        statusColor,
        disableOtherOptions,
        value,
      }) => ({
        position: id,
        value: id,
        label: name,
        optionType,
        next,
        resourceName,
        resourceId,
        image,
        required,
        group,
        resourceType,
        statusColor,
        disableOtherOptions,
        bool: optionType === "boolean" ? !!parseInt(value!) : undefined,
      }),
    )
    .sort((a, b) => a.position - b.position) || [];

export interface FormStateOption {
  value?: string | number;
  resourceName?: string;
  resourceId?: string;
  next?: number;
  text?: string;
  resourceType?: string;
  optionType?: string;
  statusColor?: string;
  disableOtherOptions?: boolean;
  inspectionIdx?: number;
  label?: string;
  bool?: boolean;
}

const prepareOption = ({
  option: {
    value,
    resourceName,
    resourceId,
    next,
    resourceType,
    optionType,
    statusColor,
    disableOtherOptions,
    label,
    bool,
  },
  text,
  inspectionIdx,
}: {
  option: ISelectableItem;
  text?: string;
  inspectionIdx?: number;
}): FormStateOption => {
  return {
    value,
    resourceName,
    resourceId,
    resourceType,
    next,
    text,
    optionType,
    statusColor,
    disableOtherOptions,
    inspectionIdx,
    label,
    bool,
  };
};

const groupOptions = (
  options: ISelectableItem[],
): Record<string, ISelectableItem[]> =>
  options.reduce((acc: Record<string, ISelectableItem[]>, curr) => {
    const groupKey = curr.group as string;
    if (!groupKey) return acc;
    if (groupKey in acc) {
      return { ...acc, [groupKey]: [...acc[groupKey], curr] };
    }
    return { ...acc, [groupKey]: [curr] };
  }, {});

const QuestionnaireRenderer = ({
  question,
  methods,
  name,
  currentValues,
}: QuestionnaireRendererProps) => {
  const { t } = useTranslation();
  const hasRequiredOptions = question?.options?.some((o) => o.required);
  const { control, getValues, setValue } = methods;
  const formattedOptions: ISelectableItem[] =
    formatOptionsForSelectableItems(question);
  const hasGroup = formattedOptions.every((option) => option.group);
  const groupedOptions = groupOptions(formattedOptions);

  const renderOptions = useCallback(
    (option: ISelectableItem) => {
      return (
        <React.Fragment
          key={`${option.optionType}-${option.label}-${option.required}-${option.value}`}
        >
          {question.typeField === "multiple" && (
            <ControlledCheckbox
              key={option.value}
              setValue={setValue}
              getValues={getValues}
              name={name}
              control={control}
              option={option}
              currentValues={currentValues}
            />
          )}
          {question.typeField === "list" && (
            <ControlledList
              key={option.value}
              getValues={getValues}
              setValue={setValue}
              name={name}
              control={control}
              option={option}
            />
          )}
        </React.Fragment>
      );
    },
    [name, getValues],
  );

  return (
    <FormProvider {...methods}>
      {question.typeField === "splash" && (
        <View className="flex flex-col justify-center items-center h-full">
          <View className="bg-green-300 h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center">
            <Text className="text-center text">{t("ilustrationOrIcon")}</Text>
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
          {/* Conditionally render groupped */}
          {!hasGroup && formattedOptions.map(renderOptions)}
          {hasGroup &&
            Object.keys(groupedOptions).map((title) => (
              <View key={title} className="mb-2">
                <Text type="subtitle" className="mb-3">
                  {title}
                </Text>
                {groupedOptions[title].map(renderOptions)}
              </View>
            ))}
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
  currentValues = [],
}: {
  name: string;
  control: Control<FieldValues>;
  option: ISelectableItem;
  setValue: UseFormSetValue<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
  currentValues: FormStateOption[];
}) => {
  const [itemsChecked, setItemsChecked] = useState<FormStateOption[]>([]);
  const isSelected =
    Array.isArray(itemsChecked) &&
    itemsChecked.some((item: FormStateOption) => item.value === option.value);

  const onChange = (text: string, isText?: boolean) => {
    let values = getValues(name);
    if (!values) {
      values = [];
    }

    const indexFound = values.findIndex(
      (item: ISelectableItem) => item.value === option.value,
    );

    if (indexFound > -1) {
      // we pass a flag to know if the change is only text related and avoid
      // filtering the current option out
      if (isText) return;
      const valuesToSave = values.filter(
        (item: ISelectableItem) => item.value !== option.value,
      );
      setValue(name, valuesToSave);
      setItemsChecked(valuesToSave);
    } else {
      let valuesToSave = [...values, prepareOption({ option, text })];

      if (option.disableOtherOptions) {
        valuesToSave = [prepareOption({ option, text })];
      } else {
        if (itemsChecked.some((item) => item.disableOtherOptions)) {
          valuesToSave = values;
        }
      }

      setValue(name, valuesToSave);
      setItemsChecked(valuesToSave);
    }
  };

  const conditionalDisablingItem =
    Array.isArray(itemsChecked) &&
    itemsChecked.find((item) => item.disableOtherOptions === true);
  const shouldDisable =
    !!conditionalDisablingItem &&
    option.value !== conditionalDisablingItem?.value;

  return (
    <Controller
      name={name}
      control={control}
      render={() => {
        return (
          <SelectableItem
            value={`${option.value}`}
            key={option.value}
            checked={isSelected}
            className="bg-white"
            onValueChange={onChange}
            label={option.label}
            required={!!option.required}
            optionType={option.optionType}
            type="checkbox"
            // defaultText={isSelected.text}
            disabled={!!shouldDisable}
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
  option: ISelectableItem;
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
        const onChange = (text: string) => {
          setValue(name, prepareOption({ option, text }));
        };
        return (
          <SelectableItem
            value={`${option.value}`}
            key={option.value}
            checked={isSelected}
            className="bg-white"
            onValueChange={onChange}
            label={option.label}
            required={!!option.required}
            optionType={option.optionType}
            defaultText={getValues(name)?.text}
          />
        );
      }}
    />
  );
};

export default QuestionnaireRenderer;
