"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

/** Generic error state (Error.dc.html): broken bauble, "Try again", "Back to start". */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <BrokenBauble />
        <h1 className="mt-2 font-display text-[28px] leading-[1.15] font-extrabold">{t("title")}</h1>
        <p className="max-w-[300px] text-base leading-normal text-moss">{t("body")}</p>
      </div>
      <div className="sticky bottom-0 flex flex-col items-center gap-2 border-t border-divider bg-snow px-4 pt-4 pb-7">
        <button
          type="button"
          onClick={reset}
          className="h-14 w-full cursor-pointer rounded-card bg-red text-lg font-bold text-white shadow-[0_6px_16px_rgb(193_18_31/0.25)] hover:bg-red-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pine active:scale-[0.98] motion-reduce:transition-none"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg text-base font-semibold text-pine hover:text-forest focus-visible:outline-2 focus-visible:outline-pine"
        >
          {t("backToStart")}
        </Link>
      </div>
    </main>
  );
}

function BrokenBauble() {
  return (
    <svg width="150" height="130" viewBox="0 0 150 130" aria-hidden="true">
      <path d="M75 0 V22" stroke="var(--color-line)" strokeWidth="2" />
      <rect x="65" y="18" width="20" height="13" rx="3" fill="var(--color-gold)" />
      <path d="M75 31 A44 44 0 0 0 33 82 L62 70 L52 96 L78 84 Z" fill="var(--color-pine)" />
      <path
        d="M75 31 A44 44 0 0 1 117 82 L100 90 L108 104 L84 92 Z"
        fill="var(--color-pine)"
        transform="translate(10 6) rotate(10 100 70)"
      />
      <circle cx="58" cy="54" r="7" fill="#FFFFFF" opacity="0.25" />
      <circle cx="40" cy="118" r="3" fill="var(--color-pine)" />
      <circle cx="118" cy="122" r="2.5" fill="var(--color-pine)" />
    </svg>
  );
}
