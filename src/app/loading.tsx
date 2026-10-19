import { getTranslations } from "next-intl/server";
import { GiftIcon } from "@/components/icons";

/** Loading state: skeleton of the name picker (Loading.dc.html). */
export default async function Loading() {
  const [t, tCommon] = await Promise.all([getTranslations("loading"), getTranslations("common")]);
  const widths = [170, 140, 200, 160, 120, 180];

  return (
    <main aria-busy="true" className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-[22px] px-4 pt-4 pb-6">
      <div className="flex min-h-[50px] items-center justify-between">
        <div className="flex items-center gap-2">
          <GiftIcon size={26} className="text-red" />
          <span className="font-display text-lg font-extrabold">{tCommon("appName")}</span>
        </div>
        <div aria-hidden="true" className="h-[50px] w-[138px] rounded-full bg-sand" />
      </div>
      <div aria-hidden="true" className="flex flex-col gap-2.5">
        <div className="h-3.5 w-[150px] animate-pulse rounded-md bg-sand-dark motion-reduce:animate-none" />
        <div className="h-9 w-[230px] animate-pulse rounded-lg bg-sand-dark motion-reduce:animate-none" />
      </div>
      <div aria-hidden="true" className="flex flex-col gap-2">
        {widths.map((w, i) => (
          <div key={i} className="flex h-15 items-center rounded-card bg-white px-[18px] shadow-[0_1px_2px_rgb(15_42_29/0.05)]">
            <div
              className="h-4 animate-pulse rounded-md bg-sand motion-reduce:animate-none"
              style={{ width: w, animationDelay: `${i * 120}ms` }}
            />
          </div>
        ))}
      </div>
      <p role="status" className="flex items-center justify-center gap-2.5 text-[15px] text-moss">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
          className="animate-spin text-pine [animation-duration:3s] motion-reduce:animate-none"
        >
          <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" />
          <path d="M9.5 3.5L12 5l2.5-1.5M9.5 20.5L12 19l2.5 1.5" />
        </svg>
        {t("names")}
      </p>
    </main>
  );
}
