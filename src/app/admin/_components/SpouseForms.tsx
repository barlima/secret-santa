"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId } from "react";
import type { AdminParticipant } from "@/lib/admin";
import { pairSpouses, unpairSpouses } from "../actions";
import { initialAdminState, type AdminActionState } from "../state";
import { AdminErrorText } from "./AdminErrorText";
import { useRedrawCheck } from "./RedrawPrompt";

const selectClass =
  "h-[50px] w-full cursor-pointer appearance-none rounded-xl border-[1.5px] border-line bg-snow pr-9 pl-3 text-base text-forest outline-none focus:border-pine focus-visible:ring-4 focus-visible:ring-pine/25";

function Chevron() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pointer-events-none absolute top-4 right-2.5 text-moss"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Two selects + "Pair as spouses" (AdminSpouses mockup). Only unpaired people are offered. */
export function PairSpousesForm({ unpaired }: { unpaired: AdminParticipant[] }) {
  const t = useTranslations("admin.spouses");
  const check = useRedrawCheck();
  const [state, action, pending] = useActionState(
    async (prev: AdminActionState, formData: FormData) => check(await pairSpouses(prev, formData)),
    initialAdminState,
  );
  const idA = useId();
  const idB = useId();
  const canPair = unpaired.length >= 2;

  return (
    <form action={action} className="flex flex-col gap-3 rounded-card bg-white p-4 shadow-card">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={idA} className="text-sm font-semibold">
            {t("personLabel")}
          </label>
          <div className="relative">
            {/* key: reset the choice after every pairing, when the options change. */}
            <select id={idA} name="personA" key={`a-${state.seq}`} defaultValue={unpaired[0]?.id} disabled={!canPair} className={selectClass}>
              {unpaired.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={idB} className="text-sm font-semibold">
            {t("spouseLabel")}
          </label>
          <div className="relative">
            <select id={idB} name="personB" key={`b-${state.seq}`} defaultValue={unpaired[1]?.id} disabled={!canPair} className={selectClass}>
              {unpaired.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!canPair || pending}
        aria-busy={pending || undefined}
        className="flex h-13 cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine text-base font-bold text-white hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 20s-7-4.4-9.3-8.6C1 8 3 4.5 6.5 4.5c2 0 3.5 1.2 5.5 3.3 2-2.1 3.5-3.3 5.5-3.3C21 4.5 23 8 21.3 11.4 19 15.6 12 20 12 20z" />
        </svg>
        {t("pair")}
      </button>
      {state.error && <AdminErrorText error={state.error} />}
    </form>
  );
}

/** "Unpair" for one spouse pair. */
export function UnpairButton({ pairId }: { pairId: string }) {
  const t = useTranslations("admin.spouses");
  const check = useRedrawCheck();
  const [state, action, pending] = useActionState(
    async (prev: AdminActionState, formData: FormData) => check(await unpairSpouses(prev, formData)),
    initialAdminState,
  );

  return (
    <form action={action} className="flex flex-col items-end">
      <input type="hidden" name="pairId" value={pairId} />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 cursor-pointer rounded-[10px] px-3 text-[15px] font-bold text-error hover:bg-error-soft focus-visible:outline-2 focus-visible:outline-pine disabled:opacity-60"
      >
        {t("unpair")}
      </button>
      {state.error && <AdminErrorText error={state.error} />}
    </form>
  );
}
