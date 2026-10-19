import { createClient } from "@/lib/supabase/server";

// Temporary start page for stage 1: proves fonts, colour tokens and the
// Supabase connection work on the Vercel preview. Replaced by the name
// picker in stage 3.

const swatches = [
  { name: "Christmas red", className: "bg-red", hex: "#C1121F" },
  { name: "Pine green", className: "bg-pine", hex: "#1B5E3A" },
  { name: "Warm gold", className: "bg-gold", hex: "#E0B04C" },
  { name: "Snow white", className: "bg-snow border border-sand", hex: "#FBF8F3" },
  { name: "Deep forest", className: "bg-forest", hex: "#0F2A1D" },
] as const;

async function getParticipantCount(): Promise<number | null> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true });
    return error ? null : count;
  } catch {
    return null;
  }
}

export default async function Home() {
  const participantCount = await getParticipantCount();
  const connected = participantCount !== null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-4 pt-4 pb-8">
      <header className="flex min-h-11 items-center gap-2">
        <GiftIcon />
        <span className="font-display text-lg font-extrabold">Secret Santa</span>
      </header>

      <section>
        <p className="text-[13px] font-bold tracking-[0.1em] text-pine uppercase">
          Family Christmas 2026
        </p>
        <h1 className="mt-1.5 font-display text-4xl leading-[1.05] font-extrabold">
          Coming soon
        </h1>
        <p className="mt-2 text-base text-moss">
          The app skeleton is up. Sign-in arrives in the next stage.
        </p>
      </section>

      <section aria-labelledby="palette" className="flex flex-col gap-2">
        <h2 id="palette" className="text-sm font-bold tracking-[0.08em] text-moss uppercase">
          Palette
        </h2>
        <ul className="flex flex-col gap-2">
          {swatches.map((s) => (
            <li
              key={s.hex}
              className="flex min-h-15 items-center gap-4 rounded-card bg-white px-4 shadow-card"
            >
              <span aria-hidden="true" className={`size-9 rounded-full ${s.className}`} />
              <span className="flex-1 text-[21px] font-semibold">{s.name}</span>
              <span className="text-sm font-semibold text-moss">{s.hex}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex items-start gap-3 rounded-card bg-forest p-4 text-snow">
        <span
          aria-hidden="true"
          className={`mt-1.5 size-2 shrink-0 rounded-full ${connected ? "bg-pine-light" : "bg-red"}`}
        />
        <p className="text-[15px] leading-snug">
          <strong className="font-bold">
            {connected ? "Supabase connected." : "Supabase not reachable."}
          </strong>{" "}
          <span className="text-mist">
            {connected
              ? `${participantCount} ${participantCount === 1 ? "participant" : "participants"} in the database.`
              : "Check the environment variables in Vercel."}
          </span>
        </p>
      </section>

      <button
        type="button"
        className="mt-auto h-14 rounded-card bg-red text-lg font-bold text-white shadow-[0_6px_16px_rgb(193_18_31/0.25)] transition-transform active:scale-[0.98]"
      >
        Primary button
      </button>
    </main>
  );
}

function GiftIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-red"
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}
