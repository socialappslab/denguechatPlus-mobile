import { TypeOf, object, string, z } from "zod";
import i18nInstance from "../config/i18n";
import { BaseObject } from ".";

const t = (key: string, args?: { [key: string]: string | number }) =>
  i18nInstance.t(key, args);

const passwordSchema = () =>
  string()
    .min(1, t("validation.requiredField.password"))
    .min(8, t("validation.passwordLength", { length: 8 }));

export const userNameSchema = () =>
  string()
    .min(1, t("validation.requiredField.username"))
    .min(4, t("validation.usernameLength", { length: 4 }));

export const phoneSchema = () =>
  string()
    .min(1, t("validation.requiredField.phone"))
    .min(8, t("validation.phoneLength"));

export const TYPE_LOGIN = ["username", "phone"] as const;

export const createLoginSchema = () => {
  return object({
    username: z
      .union([userNameSchema(), z.string().length(0, "")])
      .optional()
      .transform((e) => (e === "" ? undefined : e)),
    phone: z
      .union([phoneSchema(), z.string().length(0, "")])
      .optional()
      .transform((e) => (e === "" ? undefined : e)),
    password: passwordSchema(),
  });
};

const loginSchema = createLoginSchema();
export type LoginInputType = TypeOf<typeof loginSchema>;

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
  team?: string | BaseObject;
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

export const UserStatusValues = [
  "active",
  "pending",
  "inactive",
  "locked",
] as const;
export type UserStatusType = (typeof UserStatusValues)[number];

export interface IUser extends UserProfile {
  id: string;
  status?: UserStatusType;
  permissions?: string[];

  cityName?: string;
  neighborhoodName?: string;
  organizationName?: string;
  userProfile?: UserProfile;
}

export interface UserAccount {
  phone?: string;
  password: string;
  username?: string;
  email?: string;
  userProfile: UserProfile;
}

export interface UserUpdate {
  status?: UserStatusType;
  password?: string;
  username?: string;
  phone?: string;
  userProfileAttributes?: UserProfile;
  roleIds?: number[];
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

export type ChangeStatus = {
  status: UserStatusType;
};
