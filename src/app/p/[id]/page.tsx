import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Snowfall } from "@/components/Snowfall";
import { ChevronLeftIcon } from "@/components/icons";
import { getParticipant, initials } from "@/lib/participants";
import { EnterPasswordForm } from "./EnterPasswordForm";
import { SetPasswordForm } from "./SetPasswordForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const participant = await getParticipant((await params).id);
  const t = await getTranslations("common");
  return { title: participant ? `${participant.full_name} · ${t("appName")}` : t("appName") };
}

/**
 * Screens 2 and 3: set a password on the first visit (SetPassword.dc.html),
 * enter it on later visits (EnterPassword.dc.html).
 */
export default async function PasswordPage({ params }: Props) {
  const { id } = await params;
  const participant = await getParticipant(id);
  if (!participant) notFound();

  const isFirstVisit = !participant.has_password;
  const [tCommon, tSet, tEnter] = await Promise.all([
    getTranslations("common"),
    getTranslations("setPassword"),
    getTranslations("enterPassword"),
  ]);

  return (
    <>
    <Snowfall tone="light" />
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <div className="flex flex-col gap-6 px-4 pt-4">
        <header className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-base font-semibold text-pine hover:text-forest focus-visible:outline-2 focus-visible:outline-pine"
          >
            <ChevronLeftIcon size={20} />
            {tCommon("notYou")}
          </Link>
          <LanguageSwitcher />
        </header>

        <div className="flex flex-col items-start gap-3.5 pt-2">
          <div
            aria-hidden="true"
            className={`flex size-18 items-center justify-center rounded-full font-display text-[26px] font-extrabold ${
              isFirstVisit ? "bg-pine text-snow" : "bg-red text-white"
            }`}
          >
            {initials(participant.full_name)}
          </div>
          <div>
            <p className="text-[13px] font-bold tracking-[0.1em] text-pine uppercase">
              {isFirstVisit ? tSet("eyebrow") : tEnter("eyebrow")}
            </p>
            <h1 className="mt-1.5 font-display text-[30px] leading-[1.1] font-extrabold break-words">
              {participant.full_name}
            </h1>
            {isFirstVisit && (
              <p className="mt-2.5 text-base leading-normal text-moss">{tSet("intro")}</p>
            )}
          </div>
        </div>
      </div>

      {isFirstVisit ? (
        <SetPasswordForm participantId={participant.id} />
      ) : (
        <EnterPasswordForm participantId={participant.id} />
      )}
    </main>
    </>
  );
}
