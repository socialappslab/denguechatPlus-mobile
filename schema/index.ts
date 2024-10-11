import { TypeOf, object, z } from "zod";
import i18nInstance from "@/config/i18n";

export const t = (key: string, args?: { [key: string]: string | number }) =>
  i18nInstance.t(key, args);

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
  sectorId?: number;
  sectorName?: string;
  wedgeId?: number;
  wedgeName?: string;
  sector_id?: number;
  sector_name?: string;
  wedge_id?: number;
  wedge_name?: string;
  sector?: BaseObject;
  wedge?: BaseObject;
  members: Member[];
  memberCount: number;
  visits: number;
  sitesStatuses: {
    green?: number;
    yellow?: number;
    red?: number;
  };
}

export const createHouseSchema = () => {
  return object({
    number: z.coerce.number({
      required_error: t("validation.required"),
      invalid_type_error: t("validation.invalidNumber"),
    }),
  });
};

const houseSchema = createHouseSchema();
export type HouseInputType = TypeOf<typeof houseSchema>;

export const createPostSchema = () => {
  return object({
    content: z
      .string()
      .min(1, { message: t("validation.contentPostLengthMin") })
      .max(280, { message: t("validation.contentPostLengthMax") }),
  });
};

const postSchema = createPostSchema();
export type PostInputType = TypeOf<typeof postSchema>;

export type PostVisibility = "public" | "team";

export const createCommentSchema = () => {
  return object({
    content: z
      .string()
      .min(1, { message: t("validation.contentCommentLengthMin") })
      .max(280, { message: t("validation.contentCommentLengthMax") }),
  });
};

const commentSchema = createCommentSchema();
export type CommentInputType = TypeOf<typeof commentSchema>;
