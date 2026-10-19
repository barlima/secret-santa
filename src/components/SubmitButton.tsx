"use client";

import { useFormStatus } from "react-dom";

/** Full-width primary (red) button. Disabled while its form's Server Action runs. */
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="flex h-14 w-full cursor-pointer items-center justify-center rounded-card bg-red text-lg font-bold text-white shadow-[0_6px_16px_rgb(193_18_31/0.25)] transition-transform hover:bg-red-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pine active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"
    >
      {children}
    </button>
  );
}
