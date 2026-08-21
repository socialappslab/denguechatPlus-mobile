import { Inspection } from "@/types";

export const sanitizeInspections = (
  inspections: Inspection[],
): Inspection[] => {
  return (
    inspections
      // NOTE: questions that aren't about a container (e.g. picking where the
      // visit starts) still land on an inspection object because they carry a
      // `location`. Without a breeding site type there's no container to
      // report, and the backend rejects the whole visit, so we drop them.
      .filter((i) => !!i?.breeding_site_type_id)
      .map((i) => {
        const sanitizedInspection: Inspection = {
          // @ts-expect-error
          has_water: i?.has_water?.value,
          breeding_site_type_id: i?.breeding_site_type_id,
          container_protection_ids: i?.container_protection_ids?.map(
            // @ts-expect-error
            (item) => item.id,
          ),
          elimination_method_type_ids: i?.elimination_method_type_ids,
          other_elimination_method: i?.other_elimination_method,
          quantity_founded: i?.quantity_founded,
          // @ts-expect-error
          was_chemically_treated: i?.was_chemically_treated?.value,
          code_reference: i?.code_reference,
          container_test_result: i?.container_test_result,
          other_protection: i?.other_protection,
          photo_id: i?.photo_id,
          // @ts-expect-error
          type_content_id: i?.type_content_id?.map((item) => item.id),
          visited_at: i?.visited_at,
          water_source_other: i?.water_source_other,
          water_source_type_ids: i?.water_source_type_ids,
          location: i?.location,
        };
        // sanitize
        // @ts-expect-error
        Object.keys(sanitizedInspection).forEach((key: keyof Inspection) =>
          sanitizedInspection[key] === undefined
            ? delete sanitizedInspection[key]
            : {},
        );
        return sanitizedInspection;
      })
      // NOTE: since https://denguechat.atlassian.net/browse/DNG-850 we're now
      // assuming that all registered containers have water
      .map((inspection) => ({
        ...inspection,
        has_water: true,
      }))
  );
};
