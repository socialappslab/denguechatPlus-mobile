import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/assets/i18n/en.json";
import es from "@/assets/i18n/es.json";
import pt from "@/assets/i18n/pt.json";

const resources = { en, es, pt };

i18n.use(initReactI18next).init({
  // TODO: our app throws an error about the pluralization not being correct in
  // our locale files but it think is a mistake. Still we need to fix that by
  // avoiding any `*Plural` in our keys and remove this key.
  compatibilityJSON: "v3",
  resources,
  fallbackLng: "es",
  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
});

export default i18n;
