// Shared by the admin Server Actions and their forms. Kept out of actions.ts,
// which may only export async functions ("use server").

export type AdminError =
  | "emptyName"
  | "nameTooLong"
  | "duplicateName"
  | "samePerson"
  | "alreadyPaired"
  | "forbidden"
  | "generic";

export type AdminActionState = {
  error: AdminError | null;
  /** The group changed after a finished draw: ask whether to draw again. */
  askRedraw: boolean;
  /** Increments on every completed action, so dialogs can react to each one. */
  seq: number;
  /** What was typed, returned on validation errors so the field keeps it. */
  fullName?: string;
};

export const initialAdminState: AdminActionState = { error: null, askRedraw: false, seq: 0 };
