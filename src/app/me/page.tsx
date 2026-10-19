import type { Viewport } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";
import { Snowfall } from "@/components/Snowfall";
import { GiftIcon } from "@/components/icons";
import { getMyDrawState } from "@/lib/draw";
import { firstName, getCurrentParticipant } from "@/lib/participants";
import { LiveRefresh } from "./LiveRefresh";
import { RevealGift } from "./RevealGift";
import { WaitingRoom } from "./WaitingRoom";

/** Dark screen: match the browser chrome on phones. */
export const viewport: Viewport = { themeColor: "#0F2A1D" };

/**
 * Signed-in participant home. Shows the waiting room until the draw is done,
 * then the reveal. Updates live while waiting.
 */
export default async function MePage() {
  const session = await getCurrentParticipant();
  if (!session) redirect("/");

  const { participant } = session;
  const [t, tWaiting, tCommon, state] = await Promise.all([
    getTranslations("me"),
    getTranslations("waiting"),
    getTranslations("common"),
    participant ? getMyDrawState(participant.id) : Promise.resolve(null),
  ]);

  const live = state !== null && state.kind !== "revealed";

  return (
    <div className="min-h-dvh bg-forest text-snow">
      <Snowfall tone="dark" />
      <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col gap-7 px-4 pt-4">
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

        {!participant || !state ? (
          <section className="flex flex-col gap-3">
            <h1 className="font-display text-[28px] leading-[1.15] font-extrabold">{t("notOnListTitle")}</h1>
            <p className="text-[17px] leading-normal text-mist">{t("notOnListBody")}</p>
          </section>
        ) : state.kind === "revealed" ? (
          <RevealGift
            receiverName={state.receiverName}
            storageKey={`santa:opened:${participant.id}:${state.drawnAt ?? "draw"}`}
          />
        ) : state.kind === "joinedAfterDraw" ? (
          <section className="flex flex-col gap-3 pt-6">
            <h1 className="font-display text-[26px] leading-[1.25] font-semibold">{tWaiting("joinedAfterDraw")}</h1>
          </section>
        ) : (
          <WaitingRoom members={state.members} kind={state.kind} />
        )}

        <footer className="mt-auto flex flex-col items-center gap-2 border-t border-white/10 pt-[18px] pb-7">
          {live && (
            <p className="flex items-center gap-2 text-[15px] text-mist">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-pine-light shadow-[0_0_0_4px_rgb(63_160_106/0.25)]"
              />
              {tCommon("liveUpdates")}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-4">
            {participant?.is_admin && (
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center rounded-lg px-2 text-base font-semibold text-gold hover:text-gold-light focus-visible:outline-2 focus-visible:outline-gold"
              >
                {t("adminLink")}
              </Link>
            )}
            <SignOutButton tone="dark" />
          </div>
        </footer>
      </main>
      {live && <LiveRefresh />}
    </div>
  );
}
