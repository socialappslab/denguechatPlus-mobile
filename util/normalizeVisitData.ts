/**
 * This function makes sure every piece of data is correct
 */
import { Inspection, VisitData } from "@/types";

export const normalizeVisitData = (visit: VisitData) => {
  const normalizedVisit = { ...visit };
  delete normalizedVisit["statusColor"];
  delete normalizedVisit["colorsAndQuantities"];
  let normalizedInspections: Inspection[] = [];
  for (let inspection of visit.inspections) {
    const normalizedInspection: Inspection = {
      breeding_site_type_id: inspection.breeding_site_type_id,
      container_protection_id: inspection.container_protection_id,
      elimination_method_type_id: inspection.elimination_method_type_id,
      has_water: inspection.has_water,
      quantity_founded: inspection.quantity_founded,
      was_chemically_treated: inspection.was_chemically_treated,
      code_reference: inspection.code_reference,
      container_test_result: inspection.container_test_result,
      other_protection: inspection.other_protection,
      photo_id: inspection.photo_id,
      type_content_id: inspection.type_content_id,
      visited_at: inspection.visited_at,
      water_source_other: inspection.water_source_other,
      water_source_type_id: inspection.water_source_type_id,
    };
    normalizedInspections.push(normalizedInspection);
  }
  return { ...normalizedVisit, inspections: normalizedInspections };
};
