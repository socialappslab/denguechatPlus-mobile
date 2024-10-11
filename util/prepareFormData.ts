import { FormState } from "@/types";

// StatusColor utils
export enum StatusColor {
  INFECTED = "RED",
  POTENTIONALLY_INFECTED = "YELLOW",
  NO_INFECTED = "GREEN",
}
type Inspection = Record<string, string | undefined | boolean | string[]>;
type Answer = Record<string, string | number | undefined>;

/**
 *
 * @param formData
 * @returns takes all SelectableItems from a given formState and returns
 * formatted inspection, answers and colorStatus
 */
export const prepareFormData = (formData: FormState) => {
  const questions = Object.keys(formData);
  let inspections: Inspection[] = [];
  let answers: Answer[] = [];
  let statusColors: StatusColor[] = [];

  questions.forEach((question) => {
    const answer = formData[question];
    const index = parseInt(question.split("-")[1]);
    if (!inspections[index]) inspections[index] = {};
    if (!answers[index]) answers[index] = {};

    if (Array.isArray(answer)) {
      const [first] = answer;
      const resourceName = first.resourceName as string;
      if (!resourceName) return;
      inspections[index][resourceName] = answer.map(
        (item) => item.text || (item.resourceId as string),
      );

      const colors: StatusColor[] = answer
        .filter((item) => typeof item.statusColor === "string")
        .map((item) => item.statusColor as StatusColor);

      statusColors.push(...colors);
      return;
    }

    /**
     * We check for inspection questions
     */
    if (answer.resourceName) {
      const resourceName = answer.resourceName;
      if (answer.resourceType === "relation")
        inspections[index][resourceName] = answer.text || answer.resourceId;

      if (answer.resourceType === "attribute") {
        inspections[index][resourceName] =
          answer.text || answer.bool || answer.label;
      }

      if (answer.statusColor)
        statusColors.push(answer.statusColor as StatusColor);

      if (resourceName === "quantity_founded") {
        inspections[index][resourceName] = answer.bool ? answer.text : "1";
      }

      if (resourceName === "photo_id") {
        inspections[index][resourceName] = "temp";
      }
    }

    /**
     * All other questions are stored in answers
     */
    if (!answer.resourceName) {
      const questionId = `question_${question}`;
      answers[index][questionId] = answer.value;
    }
  });

  // We order with RED beign first, then YELLOW, then GREEN
  const orderedStatus = statusColors.sort((a, b) => {
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  });
  // And get the first
  const [statusColor] = orderedStatus;

  return { inspections, answers, statusColor: statusColor as StatusColor };
};
