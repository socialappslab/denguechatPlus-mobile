export enum StatusColor {
  INFECTED = "RED",
  POTENTIONALLY_INFECTED = "YELLOW",
  NO_INFECTED = "GREEN",
}

export interface Status {
  color: StatusColor;
  quantity: number;
}

export type Inspection = Record<
  string,
  string | undefined | boolean | string[]
>;
export type Answer = Record<string, string | number | undefined>;
