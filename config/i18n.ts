import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/assets/i18n/en.json";
import es from "@/assets/i18n/es.json";
import pt from "@/assets/i18n/pt.json";

const resources = { en, es, pt };

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "es",
  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
});

export default i18n;
