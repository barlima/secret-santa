import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { GiftIcon } from "@/components/icons";

/** Unknown page or participant link (e.g. a removed person's /p/<id>). */
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <GiftIcon size={48} className="text-red" />
      <h1 className="font-display text-[28px] leading-[1.15] font-extrabold">{t("title")}</h1>
      <p className="max-w-[300px] text-base leading-normal text-moss">{t("body")}</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-13 items-center justify-center rounded-card bg-red px-6 text-base font-bold text-white hover:bg-red-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pine"
      >
        {t("back")}
      </Link>
    </main>
  );
}
