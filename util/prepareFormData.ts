import { FormState, VisitData } from "@/types";
import { Answer, Inspection, StatusColor } from "@/types/prepareFormData";

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
  let visit: Partial<VisitData> = {};

  questions.forEach((question) => {
    const answer = formData[question];
    const index = parseInt(question.split("-")[1]);
    if (!inspections[index]) inspections[index] = {};
    if (!answers[index]) answers[index] = {};

    if (Array.isArray(answer)) {
      const [first] = answer;
      if (!first) return;
      const resourceName = first.resourceName as string;
      if (!resourceName) return;

      inspections[index][resourceName] = answer.map(
        (item) => item.text || (item.resourceId as string),
      );

      if (resourceName === "container_protection_ids") {
        inspections[index][resourceName] = answer.map((item) => ({
          id: item.resourceId,
          statusColor: item.statusColor,
          weightedPoints: item.weightedPoints,
        }));

        const textAreaOption = answer.find(
          (item) => item.optionType === "textArea",
        );
        if (textAreaOption) {
          inspections[index]["other_protection"] = textAreaOption.text;
        }
      }

      if (resourceName === "type_content_id") {
        inspections[index]["type_content_id"] = answer.map((item) => ({
          id: item.resourceId,
          statusColor: item.statusColor,
          weightedPoints: item.weightedPoints,
        }));
      }

      if (resourceName === "host")
        visit.host = answer.map((item) => item.label);

      const colors: StatusColor[] = answer
        .filter((item) => typeof item.statusColor === "string")
        .map((item) => item.statusColor as StatusColor);

      if (Array.isArray(inspections[index].statusColors)) {
        (inspections[index].statusColors as string[]).push(...colors);
      } else {
        inspections[index].statusColors = colors;
      }
      return;
    }

    /**
     * We check for inspection questions
     */
    if (answer.resourceName) {
      const resourceName = answer.resourceName;
      if (answer.resourceType === "relation")
        inspections[index][resourceName] = answer.resourceId;

      if (answer.resourceType === "attribute") {
        inspections[index][resourceName] = {
          value: answer.text ?? answer.bool ?? answer.label,
          statusColor: answer.statusColor,
          weightedPoints: answer.weightedPoints,
        };
      }

      if (answer.selectedCase) {
        inspections[index]["location"] = answer.selectedCase;
      }

      if (answer.statusColor) {
        if (Array.isArray(inspections[index].statusColors)) {
          (inspections[index].statusColors as string[]).push(
            answer.statusColor,
          );
        } else {
          inspections[index].statusColors = [answer.statusColor];
        }
      }

      if (resourceName === "quantity_founded") {
        inspections[index][resourceName] = !!answer.text
          ? parseInt(answer.text) + 1
          : 1;
      }

      if (answer.resourceName === "elimination_method_type_id" && answer.text) {
        inspections[index]["other_elimination_method"] = answer.text;
      }

      if (resourceName === "water_source_type_id" && answer.text) {
        inspections[index]["water_source_other"] = answer.text;
      }

      if (resourceName === "photo_id") {
        inspections[index][resourceName] = "temp";
      }
    }

    // Check for location
    if (answer.selectedCase) {
      inspections[index]["location"] = answer.selectedCase;
    }

    /**
     * All other questions are stored in answers
     */
    if (!answer.resourceName) {
      const questionId = `question_${question}`;
      answers[index][questionId] = answer.value;
    }

    // Always set quantity_founded when there's a container
    if (
      Object.keys(inspections[index]).length > 0 &&
      !inspections[index]["quantity_founded"] &&
      inspections[index]["breeding_site_type_id"]
    ) {
      inspections[index]["quantity_founded"] = 1;
    }

    // We order with RED beign first, then YELLOW, then GREEN
    if (Array.isArray(inspections[index].statusColors)) {
      inspections[index].statusColor = orderStatus(
        (inspections[index].statusColors as StatusColor[]) || [],
      );
    }

    // If by the end we don't have a status color, we set it here
    if (!inspections[index].statusColor)
      inspections[index].statusColor = StatusColor.NotInfected;
  });

  const returnObject = {
    inspections,
    answers,
    visit,
  };
  return returnObject;
};

export const orderStatus = (statusColors: StatusColor[]) => {
  const colorOrder = Object.values(StatusColor);
  const ordered = statusColors.sort(
    (a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b),
  );
  if (ordered[0]) return ordered[0];
  return StatusColor.NotInfected;
};
