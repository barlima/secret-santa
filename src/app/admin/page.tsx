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
