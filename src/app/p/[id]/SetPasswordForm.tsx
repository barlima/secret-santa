"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { PasswordField } from "@/components/PasswordField";
import { SubmitButton } from "@/components/SubmitButton";
import { AlertCircleIcon } from "@/components/icons";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/auth/participant-email";
import { setPassword, type FormState, type SetPasswordError } from "./actions";

const initialState: FormState<SetPasswordError> = { error: null };

export function SetPasswordForm({ participantId }: { participantId: string }) {
  const t = useTranslations("setPassword");
  const tCommon = useTranslations("common");
  const [state, formAction] = useActionState(setPassword, initialState);

  const passwordError =
    state.error === "tooShort"
      ? t("tooShort", { min: PASSWORD_MIN_LENGTH })
      : state.error === "tooLong"
        ? t("tooLong", { max: PASSWORD_MAX_LENGTH })
        : null;
  const confirmError = state.error === "mismatch" ? t("mismatch") : null;
  const formError =
    state.error === "alreadyClaimed"
      ? t("alreadyClaimed")
      : state.error === "generic"
        ? tCommon("genericError")
        : null;

  return (
    <form action={formAction} className="flex flex-1 flex-col" noValidate>
      <input type="hidden" name="participantId" value={participantId} />

      <div className="flex flex-col gap-5 px-4 pt-6 pb-8">
        <PasswordField
          name="password"
          label={t("passwordLabel")}
          autoComplete="new-password"
          hint={t("passwordHint", { min: PASSWORD_MIN_LENGTH })}
          error={passwordError}
          autoFocus
        />
        <PasswordField
          name="confirm"
          label={t("confirmLabel")}
          autoComplete="new-password"
          error={confirmError}
        />
        {formError && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-card bg-error-soft px-4 py-3 text-[15px] font-semibold text-error"
          >
            <AlertCircleIcon size={18} className="mt-0.5 shrink-0" />
            {formError}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 mt-auto flex flex-col gap-3 border-t border-divider bg-snow px-4 pt-4 pb-7">
        <SubmitButton>{t("submit")}</SubmitButton>
        <p className="text-center text-sm text-moss">{t("drawNote")}</p>
      </div>
    </form>
  );
}
