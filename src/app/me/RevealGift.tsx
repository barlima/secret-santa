"use client";

import { useTranslations } from "next-intl";
import { useCallback, useSyncExternalStore } from "react";

type Props = {
  receiverName: string;
  /** Unique per draw run, so a redraw shows a closed gift again. */
  storageKey: string;
};

const OPENED_EVENT = "santa:gift-opened";

function readOpened(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(OPENED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(OPENED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Screen 5: tap the gift, then see who you're buying for (Reveal.dc.html). */
export function RevealGift({ receiverName, storageKey }: Props) {
  const t = useTranslations("reveal");
  // Closed on the server; opened state comes from localStorage after hydration.
  const opened = useSyncExternalStore(
    subscribe,
    () => readOpened(storageKey),
    () => false,
  );

  const open = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // Private mode: the gift just opens for this visit.
    }
    window.dispatchEvent(new Event(OPENED_EVENT));
  }, [storageKey]);

  if (!opened) {
    return (
      <div className="flex flex-col items-center gap-7 pt-12 text-center">
        <div>
          <p className="text-[13px] font-bold tracking-[0.1em] text-gold uppercase">{t("eyebrow")}</p>
          <h1 className="mt-2.5 font-display text-[32px] leading-[1.1] font-extrabold">{t("title")}</h1>
        </div>
        <button
          type="button"
          onClick={open}
          aria-label={t("openGift")}
          className="gift-closed cursor-pointer rounded-3xl p-2 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          <ClosedGift />
        </button>
        <p className="text-[17px] text-mist">{t("tapHint")}</p>
      </div>
    );
  }

  return (
    <div className="gift-opened flex flex-col items-center gap-2 pt-10 text-center">
      <p className="text-[17px] font-semibold text-mist">{t("buyingFor")}</p>
      <h1 className="mt-1 font-display text-[42px] leading-[1.05] font-extrabold break-words text-gold">
        {receiverName}
      </h1>
      <OpenedGift />
      <div className="mt-3 flex items-start gap-3 rounded-card bg-white/7 px-4 py-3.5 text-left">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="mt-px shrink-0 text-gold"
        >
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <p className="text-[15px] leading-snug text-mist">
          <strong className="font-bold text-snow">{t("secretTitle")}</strong> {t("secretBody")}
        </p>
      </div>
    </div>
  );
}

function GiftBox() {
  return (
    <>
      <ellipse cx="120" cy="206" rx="82" ry="8" fill="#000000" opacity="0.25" />
      <rect x="50" y="100" width="140" height="100" rx="8" fill="var(--color-red)" />
      <rect x="112" y="100" width="16" height="100" fill="var(--color-gold)" />
    </>
  );
}

function Lid() {
  return (
    <>
      <rect x="40" y="78" width="160" height="30" rx="6" fill="var(--color-red-dark)" />
      <rect x="112" y="78" width="16" height="30" fill="var(--color-gold)" />
      <path d="M120 78 C100 40 66 48 78 72 C84 82 104 80 120 78 Z" fill="var(--color-gold)" />
      <path d="M120 78 C140 40 174 48 162 72 C156 82 136 80 120 78 Z" fill="var(--color-gold)" />
      <circle cx="120" cy="76" r="8" fill="#C9952F" />
    </>
  );
}

function ClosedGift() {
  return (
    <svg width="260" height="238" viewBox="0 0 240 220" aria-hidden="true" focusable="false">
      <GiftBox />
      <Lid />
    </svg>
  );
}

function OpenedGift() {
  return (
    <svg width="280" height="257" viewBox="0 0 240 220" aria-hidden="true" focusable="false" className="mt-2">
      <path d="M60 104 L22 0 L218 0 L180 104 Z" fill="var(--color-gold)" opacity="0.1" />
      <Sparkle x={40} y={40} size={8} fill="var(--color-gold)" />
      <Sparkle x={204} y={28} size={8} fill="var(--color-gold-light)" />
      <Sparkle x={218} y={118} size={8} fill="var(--color-gold)" />
      <Sparkle x={24} y={130} size={8} fill="var(--color-gold-light)" />
      <Sparkle x={120} y={14} size={6} fill="var(--color-snow)" />
      <rect x="84" y="36" width="6" height="10" rx="1" fill="var(--color-bulb-red)" transform="rotate(25 87 41)" />
      <rect x="156" y="52" width="6" height="10" rx="1" fill="var(--color-pine-light)" transform="rotate(-30 159 57)" />
      <rect x="66" y="76" width="5" height="9" rx="1" fill="var(--color-pine-light)" transform="rotate(50 68 80)" />
      <rect x="176" y="84" width="5" height="9" rx="1" fill="var(--color-bulb-red)" transform="rotate(-15 178 88)" />
      <GiftBox />
      <rect x="50" y="100" width="140" height="10" fill="#7A0B13" />
      <g transform="translate(-18 -58) rotate(-16 120 92)">
        <Lid />
      </g>
    </svg>
  );
}

/** Four-point star centred on (x, y). */
function Sparkle({ x, y, size, fill }: { x: number; y: number; size: number; fill: string }) {
  const s = size;
  const k = s / 4;
  return (
    <path
      d={`M${x} ${y - s} L${x + k} ${y - k} L${x + s} ${y} L${x + k} ${y + k} L${x} ${y + s} L${x - k} ${y + k} L${x - s} ${y} L${x - k} ${y - k} Z`}
      fill={fill}
    />
  );
}
