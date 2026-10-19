import { getTranslations } from "next-intl/server";
import { GiftIcon } from "@/components/icons";

/** Loading state for the waiting room / reveal: dark screen with a quiet spinner. */
export default async function Loading() {
  const t = await getTranslations("loading");

  return (
    <div className="min-h-dvh bg-forest text-snow">
      <main aria-busy="true" className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-4">
        <GiftIcon size={40} className="animate-pulse text-gold motion-reduce:animate-none" />
        <p role="status" className="text-[17px] text-mist">
          {t("generic")}
        </p>
      </main>
    </div>
  );
}
