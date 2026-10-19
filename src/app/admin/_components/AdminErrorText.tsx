"use client";

import { useTranslations } from "next-intl";
import { AlertCircleIcon } from "@/components/icons";
import type { AdminError } from "../state";

/** Translated inline error for any admin action. */
export function AdminErrorText({ error, id }: { error: AdminError; id?: string }) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const message =
    error === "emptyName"
      ? t("participants.emptyName")
      : error === "nameTooLong"
        ? t("participants.nameTooLong", { max: 80 })
        : error === "duplicateName"
          ? t("participants.duplicateName")
          : error === "samePerson"
            ? t("spouses.samePerson")
            : error === "alreadyPaired"
              ? t("spouses.alreadyPaired")
              : tCommon("genericError");

  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-[15px] font-semibold text-error">
      <AlertCircleIcon size={18} className="mt-0.5 shrink-0" />
      {message}
    </p>
  );
}
