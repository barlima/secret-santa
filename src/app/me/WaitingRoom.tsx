import { getLocale, getTranslations } from "next-intl/server";
import type { GroupMember } from "@/lib/draw";
import { shortNames } from "@/lib/participants";
import { StringOfLights } from "./StringOfLights";

type Props = {
  members: GroupMember[];
  /** waiting: people still missing · drawing: everyone in, draw running · failed: draw couldn't run */
  kind: "waiting" | "drawing" | "failed";
};

const NAMES_MARKER = "⁣NAMES⁣";

/** Screen 4: waiting room (Waiting.dc.html). */
export async function WaitingRoom({ members, kind }: Props) {
  const [t, locale] = await Promise.all([getTranslations("waiting"), getLocale()]);

  const names = shortNames(members);
  const joined = members.filter((m) => m.has_password);
  const missing = members.filter((m) => !m.has_password);
  const total = members.length;

  return (
    <div className="flex flex-col gap-7">
      <StringOfLights
        joined={joined.length}
        total={total}
        label={t("lightsLabel", { lit: joined.length, total })}
      />

      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-[56px] leading-none font-extrabold text-gold">
            {t("progressCount", { joined: joined.length, total })}
          </span>
          <span className="text-[17px] text-mist">{t("progressLabel", { joined: joined.length })}</span>
        </p>
        <h1 className="font-display text-[26px] leading-[1.25] font-semibold" aria-live="polite">
          {kind === "waiting" ? (
            <WaitingForSentence
              template={t("waitingFor", { names: NAMES_MARKER })}
              names={missing.map((m) => names.get(m.id) ?? m.full_name)}
              locale={locale}
            />
          ) : kind === "drawing" ? (
            t("drawing")
          ) : (
            t("drawFailed")
          )}
        </h1>
      </div>

      <ul aria-label={t("everyoneLabel")} className="flex flex-wrap gap-2">
        {joined.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-1.5 rounded-full border-[1.5px] border-pine-light bg-pine px-3.5 py-[9px] text-base font-semibold shadow-[0_0_14px_rgb(63_160_106/0.45)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {names.get(m.id)}
          </li>
        ))}
        {missing.map((m) => (
          <li
            key={m.id}
            className="flex items-center rounded-full border-[1.5px] border-dashed border-chip-dashed px-3.5 py-[9px] text-base font-semibold text-mist"
          >
            {names.get(m.id)}
            <span className="font-medium text-mist-dim">&nbsp;· {t("pendingSuffix")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "We are waiting for Piotr, Ola and Marek to sign up." with the names highlighted. */
function WaitingForSentence({ template, names, locale }: { template: string; names: string[]; locale: string }) {
  const [before = "", after = ""] = template.split(NAMES_MARKER);
  const parts = new Intl.ListFormat(locale, { type: "conjunction" }).formatToParts(names);

  return (
    <>
      {before}
      {parts.map((part, i) =>
        part.type === "element" ? (
          <span key={i} className="text-gold-light">
            {part.value}
          </span>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
      {after}
    </>
  );
}
