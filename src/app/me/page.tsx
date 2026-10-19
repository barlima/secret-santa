import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";
import { GiftIcon } from "@/components/icons";
import { firstName, getCurrentParticipant } from "@/lib/participants";

/**
 * Home for a signed-in participant. Stage 3 placeholder: stage 4 turns this
 * into the waiting room (Waiting.dc.html) and the reveal (Reveal.dc.html).
 */
export default async function MePage() {
  const session = await getCurrentParticipant();
  if (!session) redirect("/");

  const [t, tWaiting] = await Promise.all([getTranslations("me"), getTranslations("waiting")]);
  const { participant } = session;

  return (
    <div className="min-h-dvh bg-forest text-snow">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-7 px-4 pt-4">
        <header className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <GiftIcon size={26} className="shrink-0 text-gold" />
            {participant && (
              <span className="truncate font-display text-lg font-extrabold">
                {tWaiting("greeting", { name: firstName(participant.full_name) })}
              </span>
            )}
          </div>
          <LanguageSwitcher tone="dark" />
        </header>

        {participant ? (
          <section className="flex flex-col gap-3">
            <h1 className="font-display text-[32px] leading-[1.1] font-extrabold">{t("title")}</h1>
            <p className="text-[17px] leading-normal text-mist">{t("placeholder")}</p>
            {participant.is_admin && (
              <Link
                href="/admin"
                className="mt-3 inline-flex h-13 items-center justify-center rounded-xl border-2 border-gold px-5 text-base font-bold text-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {t("adminLink")}
              </Link>
            )}
          </section>
        ) : (
          <section className="flex flex-col gap-3">
            <h1 className="font-display text-[28px] leading-[1.15] font-extrabold">{t("notOnListTitle")}</h1>
            <p className="text-[17px] leading-normal text-mist">{t("notOnListBody")}</p>
          </section>
        )}

        <footer className="mt-auto flex justify-center border-t border-white/10 pt-[18px] pb-7">
          <SignOutButton tone="dark" />
        </footer>
      </main>
    </div>
  );
}
