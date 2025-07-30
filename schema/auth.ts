import { z } from "zod";
import { BaseObject, t, Team } from "@/schema";

const passwordSchema = z
  .string()
  .min(1, t("validation.requiredField.password"))
  .min(8, t("validation.passwordLength", { length: 8 }));

export const userNameSchema = z
  .string()
  .min(1, t("validation.requiredField.username"))
  .min(4, t("validation.usernameLength", { length: 4 }));

export const phoneSchema = z
  .string()
  .min(1, t("validation.requiredField.phone"))
  .min(8, t("validation.phoneLength"));

export const TYPE_LOGIN = ["username", "phone"] as const;

export const loginSchema = z.object({
  username: z
    .union([userNameSchema, z.string().length(0, "")])
    .optional()
    .transform((e) => (e === "" ? undefined : e)),
  phone: z
    .union([phoneSchema, z.string().length(0, "")])
    .optional()
    .transform((e) => (e === "" ? undefined : e)),
  password: passwordSchema,
});

export type LoginInputType = z.infer<typeof loginSchema>;

export type TYPE_LOGIN_REQUEST = (typeof TYPE_LOGIN)[number];

export type LoginRequestType = {
  type: TYPE_LOGIN_REQUEST;
  username?: string;
  phone?: string;
  password: string;
};
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;

  gender?: number | string;
  phone?: string;
  points?: number;
  country?: string;
  city?: string | BaseObject;
  neighborhood?: string | BaseObject;
  organization?: string | BaseObject;
  team?: string | BaseObject | Team;
  houseBlock?: string | BaseObject;
  roles?: BaseObject[];

  countryId?: number;
  cityId?: number;
  neighborhoodId?: number;
  organizationId?: number;
  teamId?: number;

  timezone?: string;
  language?: string;
  createdAt?: string;
}

export type UserStatusType = "active" | "pending" | "inactive" | "locked";

export interface IUser extends UserProfile {
  id: string;
  status?: UserStatusType;
  permissions?: string[];

  cityName?: string;
  neighborhoodName?: string;
  organizationName?: string;
  userProfile?: UserProfile;
}

export interface ILoginResponse {
  meta: {
    jwt: {
      res: {
        csrf: string;
        access: string;
        accessExpiresAt: string;
        refresh: string;
        refreshExpiresAt: string;
      };
    };
  };
}
