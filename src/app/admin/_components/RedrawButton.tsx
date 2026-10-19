"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { resetDraw } from "../actions";
import { initialAdminState } from "../state";
import { ConfirmSheet, DangerButton } from "./ConfirmSheet";
import { AdminErrorText } from "./AdminErrorText";

type Props = {
  /** Visual style of the trigger button. */
  variant: "primary" | "outline";
  label: string;
};

/** Button that opens the "Reset the draw?" sheet and calls reset_draw on confirm. */
export function RedrawButton({ variant, label }: Props) {
  const t = useTranslations("admin.draw");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(async (prev: typeof initialAdminState) => {
    const next = await resetDraw(prev);
    if (!next.error) setOpen(false);
    return next;
  }, initialAdminState);

  const triggerClass =
    variant === "primary"
      ? "h-13 w-full cursor-pointer rounded-xl bg-red text-base font-bold text-white hover:bg-red-dark"
      : "h-13 w-full cursor-pointer rounded-xl border-2 border-red bg-transparent text-base font-bold text-error hover:bg-error-soft";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${triggerClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine`}
      >
        {label}
      </button>
      {state.error && <AdminErrorText error={state.error} />}
      <ConfirmSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("resetDialogTitle")}
        body={t("resetDialogBody")}
        cancelLabel={tCommon("cancel")}
      >
        <form action={action}>
          <DangerButton pending={pending}>{t("resetDialogConfirm")}</DangerButton>
        </form>
      </ConfirmSheet>
    </>
  );
}
