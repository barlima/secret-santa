import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/actions";

/** "Log out" link-style button. `tone` matches the screen background. */
export async function SignOutButton({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const t = await getTranslations("common");
  const color =
    tone === "dark" ? "text-gold hover:text-gold-light" : "text-pine hover:text-forest";

  return (
    <form action={signOut}>
      <button
        type="submit"
        className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg px-2 text-base font-semibold focus-visible:outline-2 focus-visible:outline-current ${color}`}
      >
        {t("logOut")}
      </button>
    </form>
  );
}
