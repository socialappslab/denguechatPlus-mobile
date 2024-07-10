import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/assets/i18n/en-US.json";
import es from "@/assets/i18n/es-ES.json";

const resources = {
  en,
  es,
};

export const initI18n = (language: string) => {
  return i18n.use(initReactI18next).init({
    compatibilityJSON: "v3",
    resources,
    lng: language,
    fallbackLng: "en",
  });
};

export default i18n;
