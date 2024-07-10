import { TypeOf, object, string, z } from "zod";
import i18nInstance from "../config/i18n";

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

export interface UserProfile {
  firstName: string;
  lastName: string;
  email?: string;
  gender?: number | string;
  phone?: string;
  points?: number;
  country?: string;
  city?: string;
  neighborhood?: string;
  organization?: string;

  countryId?: number;
  cityId?: number;
  neighborhoodId?: number;
  organizationId?: number;

  timezone?: string;
  language?: string;
}

export interface IUser extends UserProfile {
  id: string;
}
