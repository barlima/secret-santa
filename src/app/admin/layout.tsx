import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ChevronLeftIcon } from "@/components/icons";
import { getAdminData } from "@/lib/admin";
import { getCurrentParticipant } from "@/lib/participants";
import { AdminTabs } from "./_components/AdminTabs";
import { RedrawButton } from "./_components/RedrawButton";
import { RedrawPromptProvider } from "./_components/RedrawPrompt";

/**
 * Admin-only area. The proxy already sends signed-out visitors to "/";
 * this checks the role. Writes are also protected by RLS in the database.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentParticipant();
  if (!session) redirect("/");
  if (!session.participant?.is_admin) redirect("/me");

  const [t, { draw }] = await Promise.all([getTranslations("admin"), getAdminData(await getLocale())]);

  return (
    <RedrawPromptProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-3 pb-8">
        <header className="flex items-center justify-between gap-2">
          <Link
            href="/me"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-base font-semibold text-pine hover:text-forest focus-visible:outline-2 focus-visible:outline-pine"
          >
            <ChevronLeftIcon size={20} />
            {t("myResult")}
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-forest px-2.5 py-1.5 text-xs font-bold tracking-[0.08em] text-snow uppercase">
              {t("badge")}
            </span>
            <LanguageSwitcher />
          </div>
        </header>

        <AdminTabs />

        {draw.status === "done" && draw.stale && (
          <section className="flex flex-col gap-3 rounded-card border-2 border-gold bg-amber-soft p-4">
            <div>
              <h2 className="text-[17px] font-bold">{t("draw.staleTitle")}</h2>
              <p className="mt-1 text-[15px] leading-normal text-ink">{t("draw.staleBody")}</p>
            </div>
            <RedrawButton variant="primary" label={t("draw.runAgain")} />
          </section>
        )}

        <main className="flex flex-col gap-4">{children}</main>
      </div>
    </RedrawPromptProvider>
  );
}
