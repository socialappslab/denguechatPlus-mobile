import { SelectableList, Text, View } from "@/components/themed";
import { InspectionQuestion } from "@/types";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

interface QuestionnaireRendererProps {
  question: InspectionQuestion;
  methods: UseFormReturn<FieldValues, any, undefined>;
}

const QuestionnaireRenderer = ({
  question,
  methods,
}: QuestionnaireRendererProps) => {
  const options = question.options;
  const hasOptions = Array.isArray(options) && options.length > 0;

  const optionsToCheckboxOption = () => {
    if (!options) return [];
    return options.map((option) => ({
      value: option.value || option.id,
      label: option.name,
      required: option.required,
    }));
  };

  const name = question.resourceName
    ? `inspection.${question.resourceName}`
    : question.id;

  return (
    <FormProvider {...methods}>
      {question.typeField !== "splash" ? (
        <View>
          <Text type="title" className="mb-8">
            {question.question}
          </Text>
          {question.typeField === "multiple" && hasOptions && (
            <SelectableList
              name={name}
              methods={methods}
              options={optionsToCheckboxOption()}
              type="checkbox"
            />
          )}
          {question.typeField === "list" && (
            <SelectableList
              name={name}
              methods={methods}
              options={optionsToCheckboxOption()}
              type="radio"
            />
          )}
        </View>
      ) : (
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
    </FormProvider>
  );
};

export default QuestionnaireRenderer;
