"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "@/components/icons";

type Props = {
  name: string;
  label: string;
  autoComplete: "new-password" | "current-password";
  hint?: string;
  error?: string | null;
  autoFocus?: boolean;
  /** Changes on every failed attempt; each change shakes the field once. */
  shakeKey?: number;
};

/** Password input with a show/hide toggle and an inline error (SetPassword / EnterPassword mockups). */
export function PasswordField({ name, label, autoComplete, hint, error, autoFocus, shakeKey }: Props) {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold">
        {label}
      </label>
      {/* Re-keyed per failed attempt so the shake animation replays. */}
      <div key={error ? shakeKey : undefined} className={`relative ${error ? "shake" : ""}`}>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`h-14 w-full rounded-xl bg-white pr-14 pl-4 text-lg text-forest outline-none focus-visible:ring-4 focus-visible:ring-pine/25 ${
            error ? "border-2 border-red" : "border-[1.5px] border-line focus:border-pine"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute top-1.5 right-1.5 flex size-11 cursor-pointer items-center justify-center rounded-[10px] text-moss hover:bg-sand focus-visible:outline-2 focus-visible:outline-pine"
        >
          {visible ? <EyeOffIcon size={22} /> : <EyeIcon size={22} />}
        </button>
      </div>
      {hint && !error && (
        <p id={hintId} className="text-sm text-moss">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-[15px] font-semibold text-error">
          <AlertCircleIcon size={18} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
