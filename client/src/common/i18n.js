import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          "banner-header": "The best prices electronics",
          "shop-now": "Shop Now",
          "explore-deals": "Explore Deals",
          "speaker-audio-system": "Speaker Audio System",
          categories: "Categories",
        },
      },
      tr: {
        translation: {
          welcome: "Hoşgeldiniz",
          "banner-header": "En iyi fiyatlı elektronik ürünler",
          "shop-now": "Şimdi Alışveriş Yap",
          "explore-deals": "Fırsatları Keşfet",
          "speaker-audio-system": "Hoparlör Ses Sistemi",
          categories: "Kategoriler",
        },
      },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
