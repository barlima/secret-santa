import { getLocale, getTranslations } from "next-intl/server";
import { setLocale } from "@/i18n/actions";
import { locales } from "@/i18n/config";

type Props = {
  /** "light" for snow screens, "dark" for the forest-green waiting room and reveal. */
  tone?: "light" | "dark";
};

/**
 * PL / EN / DE segmented control (Main.dc.html). A plain form posting to a
 * Server Action, so it works before hydration and without JavaScript.
 */
export async function LanguageSwitcher({ tone = "light" }: Props) {
  const [current, t] = await Promise.all([getLocale(), getTranslations("language")]);

  const track = tone === "dark" ? "bg-white/8" : "bg-sand";
  const active =
    tone === "dark"
      ? "bg-snow text-forest"
      : "bg-white text-forest shadow-[0_1px_3px_rgb(15_42_29/0.14)]";
  const idle = tone === "dark" ? "text-mist" : "text-moss";

  return (
    <form action={setLocale}>
      <div role="group" aria-label={t("label")} className={`flex gap-0.5 rounded-full p-[3px] ${track}`}>
        {locales.map((locale) => {
          const isActive = locale === current;
          return (
            <button
              key={locale}
              type="submit"
              name="locale"
              value={locale}
              lang={locale}
              aria-pressed={isActive}
              title={t(`names.${locale}`)}
              className={`h-11 min-w-11 cursor-pointer rounded-full text-sm font-bold uppercase transition-colors ${isActive ? active : idle}`}
            >
              {locale}
              {/* Accessible name keeps the visible code first ("PL Polski"). */}
              <span className="sr-only"> {t(`names.${locale}`)}</span>
            </button>
          );
        })}
      </div>
    </form>
  );
}
