import { getLocale, getTranslations } from "next-intl/server";
import { getAdminData } from "@/lib/admin";
import { PairSpousesForm, UnpairButton } from "../_components/SpouseForms";

/** Admin: spouse pairs (AdminSpouses.dc.html). */
export default async function AdminSpousesPage() {
  const [t, { pairs, unpaired }] = await Promise.all([
    getTranslations("admin.spouses"),
    getAdminData(await getLocale()),
  ]);

  return (
    <>
      <h1 className="font-display text-[30px] leading-[1.1] font-extrabold">{t("title")}</h1>
      <p className="text-[15px] leading-normal text-moss">{t("intro")}</p>

      <PairSpousesForm unpaired={unpaired} />

      <h2 className="mt-1.5 text-sm font-bold tracking-[0.08em] text-moss uppercase">
        {t("pairsCount", { count: pairs.length })}
      </h2>
      {pairs.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pairs.map((pair) => (
            <li key={pair.id} className="flex items-center gap-3 rounded-card bg-white py-3 pr-2 pl-4 shadow-card">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 text-red">
                <path d="M12 20s-7-4.4-9.3-8.6C1 8 3 4.5 6.5 4.5c2 0 3.5 1.2 5.5 3.3 2-2.1 3.5-3.3 5.5-3.3C21 4.5 23 8 21.3 11.4 19 15.6 12 20 12 20z" />
              </svg>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-base font-semibold">
                <span className="break-words">{pair.a.full_name}</span>
                <span className="break-words">{pair.b.full_name}</span>
              </div>
              <UnpairButton pairId={pair.id} />
            </li>
          ))}
        </ul>
      )}

      {unpaired.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="mt-1 text-sm font-bold tracking-[0.08em] text-moss uppercase">{t("notPaired")}</h2>
          <ul className="flex flex-wrap gap-2">
            {unpaired.map((p) => (
              <li
                key={p.id}
                className="rounded-full border-[1.5px] border-dashed border-line px-3 py-2 text-[15px] font-semibold text-ink"
              >
                {p.full_name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
