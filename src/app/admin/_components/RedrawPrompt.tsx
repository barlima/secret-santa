"use client";

import { useTranslations } from "next-intl";
import { createContext, useActionState, useCallback, useContext, useState } from "react";
import { resetDraw } from "../actions";
import { initialAdminState, type AdminActionState } from "../state";
import { ConfirmSheet, DangerButton } from "./ConfirmSheet";

const RedrawContext = createContext<(state: AdminActionState) => AdminActionState>((s) => s);

/**
 * One "The group has changed. Do you want to run a new draw?" sheet for the
 * whole admin panel. Lives in the admin layout, so it survives the row that
 * triggered it disappearing (e.g. after removing a person).
 * "Not now" keeps the old result; the stale banner stays until a redraw.
 */
export function RedrawPromptProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin.draw");
  const [open, setOpen] = useState(false);

  /** Pass every admin action result through this; it opens the sheet when needed. */
  const check = useCallback((state: AdminActionState) => {
    if (state.askRedraw) setOpen(true);
    return state;
  }, []);

  const [, action, pending] = useActionState(async (prev: AdminActionState) => {
    const next = await resetDraw(prev);
    setOpen(false);
    return next;
  }, initialAdminState);

  return (
    <RedrawContext.Provider value={check}>
      {children}
      <ConfirmSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("staleDialogTitle")}
        body={t("staleDialogBody")}
        cancelLabel={t("staleDialogDismiss")}
      >
        <form action={action}>
          <DangerButton pending={pending}>{t("staleDialogConfirm")}</DangerButton>
        </form>
      </ConfirmSheet>
    </RedrawContext.Provider>
  );
}

/** Returns a pass-through that opens the redraw sheet when an action asks for it. */
export function useRedrawCheck() {
  return useContext(RedrawContext);
}
