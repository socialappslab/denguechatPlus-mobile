import { Inspection } from "@/types";
import { sanitizeInspections } from "../sanitizeInspections";

// The shape prepareFormData produces is looser than the Inspection type.
const inspection = (i: Record<string, any>) => i as unknown as Inspection;

describe("sanitizeInspections", () => {
  it("drops inspections without a breeding site type", () => {
    const inspections = [
      inspection({}),
      inspection({ location: "orchard", statusColor: "GREEN" }),
    ];

    expect(sanitizeInspections(inspections)).toEqual([]);
  });

  it("keeps container inspections and forces has_water", () => {
    const inspections = [
      inspection({
        breeding_site_type_id: 12,
        has_water: { value: false },
        quantity_founded: 2,
        location: "patio",
        statusColor: "RED",
      }),
      inspection({ location: "orchard" }),
    ];

    expect(sanitizeInspections(inspections)).toEqual([
      {
        breeding_site_type_id: 12,
        has_water: true,
        quantity_founded: 2,
        location: "patio",
      },
    ]);
  });
});
