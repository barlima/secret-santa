import { getTranslations } from "next-intl/server";

/** Loading state inside the admin layout: list skeleton under the tabs. */
export default async function Loading() {
  const t = await getTranslations("loading");

  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <div aria-hidden="true" className="h-8 w-[180px] animate-pulse rounded-lg bg-sand motion-reduce:animate-none" />
      <div aria-hidden="true" className="overflow-hidden rounded-card bg-white shadow-card">
        {[160, 130, 190, 150].map((w, i) => (
          <div key={i} className="flex h-[58px] items-center border-b border-divider px-4 last:border-b-0">
            <div className="h-4 animate-pulse rounded-md bg-sand motion-reduce:animate-none" style={{ width: w }} />
          </div>
        ))}
      </div>
      <p role="status" className="sr-only">
        {t("generic")}
      </p>
    </div>
  );
}
