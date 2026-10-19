import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";
import { ChevronLeftIcon } from "@/components/icons";

/** Stage 3 placeholder for the admin panel (stage 5). Only reachable by the admin. */
export default async function AdminPage() {
  const t = await getTranslations("admin");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-3">
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
      <h1 className="font-display text-[30px] leading-[1.1] font-extrabold">{t("participants.title")}</h1>
      <p className="text-base text-moss">{t("comingSoon")}</p>
      <footer className="mt-auto flex justify-center pb-7">
        <SignOutButton tone="light" />
      </footer>
    </main>
  );
}
