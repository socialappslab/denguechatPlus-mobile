export type ErrorResponse = {
  errors: {
    error_code: number;
    detail: string;
    field: string | null;
  }[];
};

export type BaseObject = {
  id: number;
  name: string;
};

export interface BaseWithStatus extends BaseObject {
  status: boolean;
  createdAt: string;
}

export interface Organization extends BaseWithStatus {}

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  firstName: string;
  lastName: string;
  fullName: string;
  rol: string;
}

export const TEAM_LEADER_ROLE = "team_leader";

export interface Team extends BaseObject {
  organization: Organization;
  sector: string;
  wedge: string;
  leader: string;
  members: Member[];
  memberCount: number;
}
