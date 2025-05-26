import { StatusColor } from "@/types/prepareFormData";
import { orderStatus } from "../prepareFormData";

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

  it("works with an empty array", () => {
    const statuses = [] as StatusColor[];
    const res = orderStatus(statuses);
    expect(res).toBe("GREEN");
  });

  it("works with a singleton array", () => {
    const statuses = ["YELLOW"] as StatusColor[];
    const res = orderStatus(statuses);
    expect(res).toBe("YELLOW");
  });
});
