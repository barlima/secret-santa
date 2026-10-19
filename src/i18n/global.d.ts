import type { Locale } from "./config";
import type messages from "../../messages/en.json";

// Type-safe keys and locales for next-intl: t("picker.title") is checked
// against messages/en.json (the source of truth for keys).
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
