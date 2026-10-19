"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", key: "people" },
  { href: "/admin/spouses", key: "spouses" },
  { href: "/admin/draw", key: "draw" },
] as const;

/** People / Spouses / Draw segmented tabs (admin mockups). */
export function AdminTabs() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <nav aria-label={t("sectionsLabel")} className="flex gap-1 rounded-card bg-sand p-1">
      {TABS.map((tab) => {
        const current = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`flex min-h-11 flex-1 items-center justify-center rounded-[10px] text-[15px] font-bold focus-visible:outline-2 focus-visible:outline-pine ${
              current ? "bg-white text-forest shadow-[0_1px_3px_rgb(15_42_29/0.14)]" : "text-moss hover:text-forest"
            }`}
          >
            {t(`tabs.${tab.key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
