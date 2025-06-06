export enum StatusColor {
  Infected = "RED",
  PotentionallyInfected = "YELLOW",
  NotInfected = "GREEN",
}

export interface Status {
  color: StatusColor;
  quantity: number;
}

export type Inspection = Record<string, any>;
export type Answer = Record<string, string | number | undefined>;
