import { CheckboxList, Text, View } from "@/components/themed";
import { Question } from "@/types";

interface QuestionnaireRendererProps {
  question: Question;
}

const QuestionnaireRenderer = ({ question }: QuestionnaireRendererProps) => {
  const options = question.options;
  const hasOptions = Array.isArray(options) && options.length > 0;

  const optionsToCheckboxOption = () => {
    if (!options) return [];
    return options.map((option) => ({
      value: option.id,
      label: option.name,
    }));
  };

  return question.typeField !== "splash" ? (
    <View>
      <Text type="title" className="mb-8">
        {question.question}
      </Text>
      {hasOptions && <CheckboxList options={optionsToCheckboxOption()} />}
    </View>
  ) : (
    <View className="flex flex-col">
      <View className="bg-green-300 h-52 w-52 mb-8 rounded-xl border-green-300" />
      <Text type="title" className="text-center">
        {question.question}
      </Text>
      <Text type="text" className="text-center p-8 pt-4">
        {question.description}
      </Text>
    </View>
  );
};

export default QuestionnaireRenderer;
