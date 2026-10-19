import { getLocale, getTranslations } from "next-intl/server";
import { getAdminData } from "@/lib/admin";
import { RedrawButton } from "../_components/RedrawButton";

const KNOWN_REASONS = ["too_few_people", "no_valid_assignment"] as const;
type Reason = (typeof KNOWN_REASONS)[number] | "unknown";

function reason(error: string | null): Reason {
  return (KNOWN_REASONS as readonly string[]).includes(error ?? "") ? (error as Reason) : "unknown";
}

/** Admin: draw status (AdminDraw.dc.html). Never shows anyone's result. */
export default async function AdminDrawPage() {
  const locale = await getLocale();
  const [t, { participants, draw }] = await Promise.all([getTranslations("admin.draw"), getAdminData(locale)]);

  const total = participants.length;
  const joined = participants.filter((p) => p.has_password).length;
  const missing = participants.filter((p) => !p.has_password).map((p) => p.full_name);
  const missingList = new Intl.ListFormat(locale, { type: "conjunction" }).format(missing);

  return (
    <>
      <h1 className="font-display text-[30px] leading-[1.1] font-extrabold">{t("title")}</h1>

      {draw.status === "pending" && (
        <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-card">
          <StatusHeading tone="waiting" label={t("waitingLabel")} title={t("joinedCount", { joined, total })} />
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={joined}
            aria-label={t("progressLabel")}
            className="h-2.5 overflow-hidden rounded-full bg-sand"
          >
            <div
              className="h-full rounded-full bg-pine transition-[width] motion-reduce:transition-none"
              style={{ width: total ? `${(joined / total) * 100}%` : "0%" }}
            />
          </div>
          {missing.length > 0 && (
            <p className="text-[15px] leading-normal text-moss">{t("stillMissing", { names: missingList })}</p>
          )}
        </section>
      )}

      {draw.status === "done" && (
        <section className="flex flex-col gap-3.5 rounded-2xl bg-white p-5 shadow-card">
          <StatusHeading tone="done" label={t("doneLabel")} title={t("doneTitle")} />
          {draw.run_at && (
            <p className="text-[15px] leading-normal text-moss">
              {t("doneBody", { date: new Date(draw.run_at), count: total })}
            </p>
          )}
        </section>
      )}

      {draw.status === "failed" && (
        <section className="flex flex-col gap-3.5 rounded-2xl border-2 border-red/25 bg-white p-5 shadow-card">
          <StatusHeading tone="failed" label={t("failedLabel")} title={t("failedTitle")} />
          <p className="text-[15px] leading-normal text-ink">{t(`failedReasons.${reason(draw.error)}`)}</p>
          <RedrawButton variant="primary" label={t("runAgain")} />
        </section>
      )}

      <section className="mt-2 flex flex-col gap-2.5 border-t border-divider pt-5">
        <h2 className="text-[17px] font-bold">{t("resetHeading")}</h2>
        <p className="text-[15px] leading-normal text-moss">{t("resetBody")}</p>
        <RedrawButton variant="outline" label={t("resetButton")} />
      </section>
    </>
  );
}

function StatusHeading({ tone, label, title }: { tone: "waiting" | "done" | "failed"; label: string; title: string }) {
  const styles = {
    waiting: { tile: "bg-amber-soft text-amber", label: "text-amber" },
    done: { tile: "bg-pine-soft text-pine", label: "text-pine" },
    failed: { tile: "bg-error-soft text-error", label: "text-error" },
  }[tone];

  return (
    <div className="flex items-center gap-3">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-card ${styles.tile}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {tone === "waiting" && (
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </>
          )}
          {tone === "done" && <path d="M5 12.5l4.5 4.5L19 7.5" />}
          {tone === "failed" && (
            <>
              <path d="M12 3l10 18H2z" />
              <path d="M12 10v5" />
              <path d="M12 18h.01" />
            </>
          )}
        </svg>
      </div>
      <div>
        <p className={`text-[13px] font-bold tracking-[0.08em] uppercase ${styles.label}`}>{label}</p>
        <h2 className="mt-0.5 font-display text-[22px] leading-tight font-extrabold">{title}</h2>
      </div>
    </div>
  );
}
