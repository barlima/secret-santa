import { getLocale, getTranslations } from "next-intl/server";
import { getAdminData } from "@/lib/admin";
import { getCurrentParticipant } from "@/lib/participants";
import { AddPersonForm } from "./_components/AddPersonForm";
import { ParticipantRow } from "./_components/ParticipantRow";

/** Admin: participants (AdminParticipants.dc.html, Empty.dc.html). */
export default async function AdminPeoplePage() {
  const [t, data, session] = await Promise.all([
    getTranslations("admin"),
    getAdminData(await getLocale()),
    getCurrentParticipant(),
  ]);
  const selfId = session?.participant?.id;
  const { participants, draw } = data;
  const joined = participants.filter((p) => p.has_password).length;
  const onlyAdmin = participants.every((p) => p.is_admin);

  return (
    <>
      <h1 className="font-display text-[30px] leading-[1.1] font-extrabold">{t("participants.title")}</h1>

      <AddPersonForm />

      {/* The draw starts the moment everyone on the list has a password. */}
      {draw.status !== "done" && (
        <p className="rounded-card bg-paper px-4 py-3 text-[15px] leading-snug text-ink">{t("empty.warning")}</p>
      )}

      {onlyAdmin && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <svg width="112" height="136" viewBox="0 0 140 170" aria-hidden="true">
            <path d="M70 0 V34" stroke="var(--color-line)" strokeWidth="2" />
            <rect x="58" y="30" width="24" height="16" rx="3" fill="var(--color-gold)" />
            <circle cx="70" cy="104" r="58" fill="var(--color-red)" />
            <path d="M14 92 Q 70 112 126 92" fill="none" stroke="var(--color-gold)" strokeWidth="6" />
            <path d="M16 120 Q 70 140 124 120" fill="none" stroke="var(--color-gold)" strokeWidth="6" />
            <circle cx="48" cy="76" r="9" fill="#FFFFFF" opacity="0.25" />
          </svg>
          <h2 className="font-display text-2xl font-extrabold">{t("empty.title")}</h2>
          <p className="max-w-[300px] text-base leading-normal text-moss">{t("empty.body")}</p>
        </div>
      )}

      <p className="mt-1 text-sm font-semibold text-moss">
        {t("participants.summary", { total: participants.length, joined })}
      </p>
      <ul className="overflow-hidden rounded-card bg-white shadow-card">
        {participants.map((p) => (
          <ParticipantRow key={p.id} person={p} isSelf={p.id === selfId} />
        ))}
      </ul>
    </>
  );
}
