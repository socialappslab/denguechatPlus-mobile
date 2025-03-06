import { Inspection } from "@/types";

export const sanitizeInspections = (
  inspections: Inspection[],
): Inspection[] => {
  return inspections
    .map((i) => {
      const sanitizedInspection: Inspection = {
        has_water: i?.has_water,
        breeding_site_type_id: i?.breeding_site_type_id,
        container_protection_ids: i?.container_protection_ids,
        elimination_method_type_id: i?.elimination_method_type_id,
        other_elimination_method: i?.other_elimination_method,
        quantity_founded: i?.quantity_founded,
        was_chemically_treated: i?.was_chemically_treated,
        code_reference: i?.code_reference,
        container_test_result: i?.container_test_result,
        other_protection: i?.other_protection,
        photo_id: i?.photo_id,
        type_content_id: i?.type_content_id,
        visited_at: i?.visited_at,
        water_source_other: i?.water_source_other,
        water_source_type_id: i?.water_source_type_id,
      };
      // sanitize
      Object.keys(sanitizedInspection).forEach((key: keyof Inspection) =>
        sanitizedInspection[key] === undefined
          ? delete sanitizedInspection[key]
          : {},
      );
      return sanitizedInspection;
    })
    .filter((i) => Object.keys(i).length > 0);
};
