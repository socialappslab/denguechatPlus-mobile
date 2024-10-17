import { StatusColor } from "@/types/prepareFormData";
import { orderStatus, prepareFormData } from "../prepareFormData";
import red from "./fixture-red.json";
import multiple from "./fixture-multiple-red.json";
import hapore from "./fixture-hapore.json";

describe("prepareFormData", () => {
  it("status color is well defined", () => {
    const res = prepareFormData(red.contents);
    expect(res.statusColors[0]).toBe("RED");
  });

  it("status color is well defined", () => {
    const res = prepareFormData(multiple.contents);
    expect(res.statusColors[0]).toBe("GREEN");
    expect(res.statusColors[1]).toBe("YELLOW");
    expect(res.statusColors[2]).toBe("RED");
  });

  it("quantity found is well defined", () => {
    const res = prepareFormData(hapore.contents);
    expect(res.inspections[0].quantity_founded).toBe("2");
    expect(res.inspections[1].quantity_founded).toBe("6");
  });
});

describe("order colors", () => {
  it("orders colors red green", () => {
    const statuses = ["RED", "RED", "GREEN"] as StatusColor[];
    const res = orderStatus(statuses);
    expect(res).toBe("RED");
  });

  it("orders colors red yellow", () => {
    const statuses = ["RED", "RED", "YELLOW"] as StatusColor[];
    const res = orderStatus(statuses);
    expect(res).toBe("RED");
  });

  it("orders colors green yellow", () => {
    const statuses = ["GREEN", "YELLOW"] as StatusColor[];
    const res = orderStatus(statuses);
    expect(res).toBe("YELLOW");
  });
});
