"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { PasswordField } from "@/components/PasswordField";
import { SubmitButton } from "@/components/SubmitButton";
import { KeyIcon } from "@/components/icons";
import { signIn, type FormState, type SignInError } from "./actions";

const initialState: FormState<SignInError> = { error: null };

export function EnterPasswordForm({ participantId }: { participantId: string }) {
  const t = useTranslations("enterPassword");
  const tCommon = useTranslations("common");
  const [state, formAction] = useActionState(signIn, initialState);

  const error =
    state.error === "wrongPassword"
      ? t("wrongPassword")
      : state.error === "tooManyAttempts"
        ? t("tooManyAttempts")
        : state.error === "generic"
          ? tCommon("genericError")
          : null;

  return (
    <form action={formAction} className="flex flex-1 flex-col" noValidate>
      <input type="hidden" name="participantId" value={participantId} />

      <div className="flex flex-col gap-6 px-4 pt-6 pb-8">
        <PasswordField
          name="password"
          label={t("passwordLabel")}
          autoComplete="current-password"
          error={error}
          autoFocus
        />

        <div className="flex items-start gap-3 rounded-card bg-paper px-4 py-3.5">
          <KeyIcon size={22} className="mt-px shrink-0 text-pine" />
          <p className="text-[15px] leading-snug text-ink">
            <strong className="font-bold text-forest">{t("forgotTitle")}</strong> {t("forgotBody")}
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-divider bg-snow px-4 pt-4 pb-7">
        <SubmitButton>{t("submit")}</SubmitButton>
      </div>
    </form>
  );
}
