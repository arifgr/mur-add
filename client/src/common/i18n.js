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
          newsletter: {
            title: "Never Miss a Deal!",
            description:
              "Subscribe to get the latest offers, new arrivals, and exclusive discounts",
          },
          "subscribe-now": "Subscribe",
          "newsletter.placeholder": "Enter your email id",
          footer: {
            description:
              "We deliver high technology sound systems straight to your door. Trusted by thousands, we aim to make your shopping experience simple and affordable.",
          },
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
          newsletter: {
            title: "Teklifleri Kaçırmayın!",
            description:
              "En son teklifler, yeni gelenler ve özel indirimler için abone olun",
          },
          "subscribe-now": "Abone Ol",
          "newsletter.placeholder": "E-posta adresinizi girin",
          footer: {
            description:
              "Yüksek teknoloji ses sistemlerini kapınıza kadar getiriyoruz. Binlerce kişi tarafından güvenilen, alışveriş deneyiminizi basit ve uygun fiyatlı hale getirmeyi hedefliyoruz.",
          },
        },
      },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
