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
      <Text type="title" className="mb-5">
        {question.question}
      </Text>
      {hasOptions && (
        <CheckboxList className="mb-2" options={optionsToCheckboxOption()} />
      )}
    </View>
  ) : (
    <>
      <Text>Splash</Text>
    </>
  );
};

export default QuestionnaireRenderer;
