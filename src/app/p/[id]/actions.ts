"use server";

import { redirect } from "next/navigation";
import {
  isUuid,
  participantEmail,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth/participant-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SetPasswordError = "tooShort" | "tooLong" | "mismatch" | "alreadyClaimed" | "generic";
export type SignInError = "wrongPassword" | "tooManyAttempts" | "generic";

export type FormState<E extends string> = { error: E | null };

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * First visit: claim a participant by creating their auth user and linking it.
 * Linking (auth_user_id set) fires the database trigger that runs the draw
 * when this was the last person to join.
 */
export async function setPassword(
  _prev: FormState<SetPasswordError>,
  formData: FormData,
): Promise<FormState<SetPasswordError>> {
  const participantId = text(formData, "participantId");
  const password = text(formData, "password");
  const confirm = text(formData, "confirm");

  if (!isUuid(participantId)) return { error: "generic" };
  if (password.length < PASSWORD_MIN_LENGTH) return { error: "tooShort" };
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_LENGTH) return { error: "tooLong" };
  if (password !== confirm) return { error: "mismatch" };

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    // Misconfigured SUPABASE_SECRET_KEY: visible in the Vercel runtime logs.
    console.error("setPassword: admin client unavailable", error);
    return { error: "generic" };
  }

  const { data: participant, error: readError } = await admin
    .from("participants")
    .select("id, auth_user_id")
    .eq("id", participantId)
    .maybeSingle();
  if (readError) {
    console.error("setPassword: reading participant failed", readError);
    return { error: "generic" };
  }
  if (!participant) redirect("/");
  if (participant.auth_user_id) return { error: "alreadyClaimed" };

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: participantEmail(participantId),
    password,
    email_confirm: true,
    app_metadata: { participant_id: participantId },
  });
  if (createError || !created.user) {
    if (createError?.code === "weak_password") return { error: "tooShort" };
    // email_exists: an earlier attempt for this name is in flight or left an
    // unlinked auth user behind. Either way the name is not free right now.
    if (createError?.code === "email_exists") return { error: "alreadyClaimed" };
    console.error("setPassword: createUser failed", createError);
    return { error: "generic" };
  }

  // Claim atomically: only succeeds while nobody else has linked this name.
  const { data: claimed, error: claimError } = await admin
    .from("participants")
    .update({ auth_user_id: created.user.id })
    .eq("id", participantId)
    .is("auth_user_id", null)
    .select("id");

  if (claimError || !claimed?.length) {
    await admin.auth.admin.deleteUser(created.user.id);
    if (claimError) {
      console.error("setPassword: linking participant failed", claimError);
      return { error: "generic" };
    }
    return { error: "alreadyClaimed" };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: participantEmail(participantId),
    password,
  });
  if (signInError) {
    // The password is set; the person can still log in on the next screen.
    console.error("setPassword: sign-in after claim failed", signInError);
    redirect(`/p/${participantId}`);
  }

  redirect("/me");
}

/** Returning visit: log in with the participant's synthetic email. */
export async function signIn(
  _prev: FormState<SignInError>,
  formData: FormData,
): Promise<FormState<SignInError>> {
  const participantId = text(formData, "participantId");
  const password = text(formData, "password");

  if (!isUuid(participantId)) return { error: "generic" };
  if (!password) return { error: "wrongPassword" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: participantEmail(participantId),
    password,
  });

  if (error) {
    if (error.status === 429 || error.code === "over_request_rate_limit") {
      return { error: "tooManyAttempts" };
    }
    if (error.code === "invalid_credentials") return { error: "wrongPassword" };
    console.error("signIn failed", error);
    return { error: "generic" };
  }

  redirect("/me");
}
