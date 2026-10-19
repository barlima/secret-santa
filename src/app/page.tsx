import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ChevronRightIcon, GiftIcon, JoinedCheckIcon } from "@/components/icons";
import { EVENT_YEAR } from "@/lib/event";
import { listParticipants } from "@/lib/participants";

/** Screen 1: pick your name (Main.dc.html). */
export default async function PickNamePage() {
  const locale = await getLocale();
  const [participants, t, tCommon] = await Promise.all([
    listParticipants(locale),
    getTranslations("picker"),
    getTranslations("common"),
  ]);
  const joined = participants.filter((p) => p.has_password).length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-[22px] px-4 pt-4 pb-6">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GiftIcon size={26} className="text-red" />
          <span className="font-display text-lg font-extrabold">{tCommon("appName")}</span>
        </div>
        <LanguageSwitcher />
      </header>

      <div>
        <p className="text-[13px] font-bold tracking-[0.1em] text-pine uppercase">
          {tCommon("eventTitle", { year: EVENT_YEAR })}
        </p>
        <h1 className="mt-1.5 font-display text-4xl leading-[1.05] font-extrabold">{t("title")}</h1>
        <p className="mt-2 text-base text-moss">{t("intro")}</p>
      </div>

      {participants.length === 0 ? (
        <p className="rounded-card bg-paper px-4 py-3.5 text-base text-ink">{t("empty")}</p>
      ) : (
        <>
          <nav aria-label={t("listLabel")}>
            <ul className="flex flex-col gap-2">
              {participants.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/p/${p.id}`}
                    className="flex min-h-15 items-center justify-between gap-3 rounded-card bg-white py-2 pr-4 pl-[18px] text-[21px] font-semibold text-forest shadow-card transition-transform hover:bg-white/80 focus-visible:outline-3 focus-visible:outline-pine active:scale-[0.99] motion-reduce:transition-none"
                  >
                    <span className="min-w-0 break-words">{p.full_name}</span>
                    {p.has_password ? (
                      <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-pine">
                        {t("joined")}
                        <JoinedCheckIcon className="text-pine" />
                      </span>
                    ) : (
                      <ChevronRightIcon size={20} className="shrink-0 text-moss/70" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-center text-[15px] text-moss">
            {t("progress", { joined, total: participants.length })}
          </p>
        </>
      )}
    </main>
  );
}
