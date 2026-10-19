"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId } from "react";
import { addParticipant } from "../actions";
import { initialAdminState, type AdminActionState } from "../state";
import { AdminErrorText } from "./AdminErrorText";
import { useRedrawCheck } from "./RedrawPrompt";

/** "Add a person" field + button (AdminParticipants mockup). */
export function AddPersonForm() {
  const t = useTranslations("admin.participants");
  const check = useRedrawCheck();
  const [state, action, pending] = useActionState(
    async (prev: AdminActionState, formData: FormData) => check(await addParticipant(prev, formData)),
    initialAdminState,
  );
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <form action={action} className="flex flex-col gap-2">
        <label htmlFor={id} className="text-[15px] font-semibold">
          {t("addLabel")}
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            name="fullName"
            type="text"
            maxLength={80}
            autoComplete="off"
            autoCapitalize="words"
            placeholder={t("namePlaceholder")}
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? errorId : undefined}
            // React resets the form after each action: keep what was typed on errors.
            key={state.seq}
            defaultValue={state.error ? state.fullName : ""}
            className="h-13 min-w-0 flex-1 rounded-xl border-[1.5px] border-line bg-white px-3.5 text-[17px] text-forest outline-none focus:border-pine focus-visible:ring-4 focus-visible:ring-pine/25"
          />
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending || undefined}
            className="flex h-13 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-red px-[18px] text-base font-bold text-white hover:bg-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:cursor-wait disabled:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t("add")}
          </button>
        </div>
        {state.error && <AdminErrorText id={errorId} error={state.error} />}
    </form>
  );
}
