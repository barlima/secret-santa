"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId, useState } from "react";
import { KeyIcon } from "@/components/icons";
import type { AdminParticipant } from "@/lib/admin";
import { removeParticipant, renameParticipant, resetPassword } from "../actions";
import { initialAdminState, type AdminActionState } from "../state";
import { AdminErrorText } from "./AdminErrorText";
import { ConfirmSheet, DangerButton } from "./ConfirmSheet";
import { useRedrawCheck } from "./RedrawPrompt";

const iconButton =
  "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] focus-visible:outline-2 focus-visible:outline-pine";

/** One person in the admin list: status, rename, reset password, remove. */
export function ParticipantRow({ person, isSelf }: { person: AdminParticipant; isSelf: boolean }) {
  const t = useTranslations("admin.participants");
  const tCommon = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<"reset" | "remove" | null>(null);
  const inputId = useId();
  const check = useRedrawCheck();

  const [renameState, renameAction, renaming] = useActionState(
    async (prev: AdminActionState, formData: FormData) => {
      const next = await renameParticipant(prev, formData);
      if (!next.error) setEditing(false);
      return next;
    },
    initialAdminState,
  );
  const [resetState, resetAction, resetting] = useActionState(
    async (prev: AdminActionState, formData: FormData) => {
      const next = await resetPassword(prev, formData);
      setConfirm(null);
      return next;
    },
    initialAdminState,
  );
  const [removeState, removeAction, removing] = useActionState(
    async (prev: AdminActionState, formData: FormData) => {
      const next = await removeParticipant(prev, formData);
      setConfirm(null);
      return check(next);
    },
    initialAdminState,
  );

  const error = renameState.error ?? resetState.error ?? removeState.error;

  if (editing) {
    return (
      <li className="border-b border-divider px-4 py-3 last:border-b-0">
        <form action={renameAction} className="flex flex-col gap-2">
          <input type="hidden" name="participantId" value={person.id} />
          <label htmlFor={inputId} className="sr-only">
            {t("rename", { name: person.full_name })}
          </label>
          <div className="flex gap-2">
            <input
              id={inputId}
              name="fullName"
              key={renameState.seq}
              defaultValue={renameState.error ? renameState.fullName : person.full_name}
              maxLength={80}
              autoComplete="off"
              autoFocus
              aria-invalid={renameState.error ? true : undefined}
              className="h-12 min-w-0 flex-1 rounded-xl border-[1.5px] border-line bg-white px-3 text-[17px] text-forest outline-none focus:border-pine focus-visible:ring-4 focus-visible:ring-pine/25"
            />
            <button
              type="submit"
              disabled={renaming}
              className="h-12 shrink-0 cursor-pointer rounded-xl bg-pine px-4 text-base font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:opacity-70"
            >
              {t("renameSave")}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="min-h-11 self-start rounded-lg text-[15px] font-semibold text-moss hover:text-forest"
          >
            {tCommon("cancel")}
          </button>
          {renameState.error && <AdminErrorText error={renameState.error} />}
        </form>
      </li>
    );
  }

  return (
    <li className="border-b border-divider last:border-b-0">
      <div className="flex min-h-[58px] items-center gap-0.5 py-1 pr-1 pl-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-[17px] font-semibold">{person.full_name}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
              person.has_password ? "bg-pine-soft text-pine" : "bg-wait-soft text-wait"
            }`}
          >
            {person.has_password ? t("joined") : t("notYet")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={t("rename", { name: person.full_name })}
          className={`${iconButton} text-moss hover:bg-sand`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16z" />
            <path d="M13.5 6.5l4 4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setConfirm("reset")}
          disabled={!person.has_password}
          aria-label={
            person.has_password
              ? t("resetPassword", { name: person.full_name })
              : t("resetPasswordUnavailable", { name: person.full_name })
          }
          className={`${iconButton} text-moss hover:bg-sand disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent`}
        >
          <KeyIcon size={20} />
        </button>

        {isSelf ? (
          <span className="w-11 shrink-0 text-center text-[11px] font-bold text-moss/80">{t("you")}</span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm("remove")}
            aria-label={t("remove", { name: person.full_name })}
            className={`${iconButton} text-error hover:bg-error-soft`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 7h16" />
              <path d="M10 11v6M14 11v6" />
              <path d="M6 7l1 13h10l1-13" />
              <path d="M9 7V4h6v3" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="px-4 pb-3">
          <AdminErrorText error={error} />
        </div>
      )}

      <ConfirmSheet
        open={confirm === "reset"}
        onClose={() => setConfirm(null)}
        title={t("resetPasswordTitle", { name: person.full_name })}
        body={t("resetPasswordBody")}
        cancelLabel={tCommon("cancel")}
      >
        <form action={resetAction}>
          <input type="hidden" name="participantId" value={person.id} />
          <DangerButton pending={resetting}>{t("resetPasswordConfirm")}</DangerButton>
        </form>
      </ConfirmSheet>

      <ConfirmSheet
        open={confirm === "remove"}
        onClose={() => setConfirm(null)}
        title={t("removeTitle", { name: person.full_name })}
        body={t("removeBody")}
        cancelLabel={tCommon("cancel")}
      >
        <form action={removeAction}>
          <input type="hidden" name="participantId" value={person.id} />
          <DangerButton pending={removing}>{t("removeConfirm")}</DangerButton>
        </form>
      </ConfirmSheet>

    </li>
  );
}
