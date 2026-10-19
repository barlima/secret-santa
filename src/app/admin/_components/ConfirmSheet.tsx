"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  /** Action buttons (a form with the confirm button, usually). Rendered after Cancel. */
  children: React.ReactNode;
  cancelLabel: string;
};

/**
 * Bottom-sheet confirmation (AdminDraw mockup). A native <dialog>, so focus
 * trapping, Esc and the backdrop come from the browser.
 */
export function ConfirmSheet({ open, onClose, title, body, children, cancelLabel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // Tap on the backdrop (the dialog element itself, outside the panel) closes it.
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-forest/55 sm:mx-auto sm:max-w-md"
    >
      <div className="flex flex-col gap-3.5 rounded-t-[22px] bg-snow px-4 pt-6 pb-7 text-forest">
        <div aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-line" />
        <h2 id={titleId} className="font-display text-2xl font-extrabold">
          {title}
        </h2>
        <p className="text-base leading-normal text-ink">{body}</p>
        <div className="mt-1.5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-13 cursor-pointer rounded-xl border-[1.5px] border-line bg-white text-base font-bold text-forest focus-visible:outline-2 focus-visible:outline-pine"
          >
            {cancelLabel}
          </button>
          {children}
        </div>
      </div>
    </dialog>
  );
}

/** Red confirm button for a ConfirmSheet; disabled while its form submits. */
export function DangerButton({ children, pending }: { children: React.ReactNode; pending?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="h-13 w-full cursor-pointer rounded-xl bg-red text-base font-bold text-white hover:bg-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:cursor-wait disabled:opacity-70"
    >
      {children}
    </button>
  );
}
