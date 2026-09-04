"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { updateProfile } from "@/lib/db/auth";
import { EDUCATION_LEVELS, type EducationLevel } from "@/types/opportunity";

export interface ProfileFormState {
  error?: string;
  success?: string;
}

function parseLevel(value: string): EducationLevel | null {
  const match = EDUCATION_LEVELS.find((l) => l.toLowerCase() === value.trim().toLowerCase());
  return match ?? null;
}

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in to do that." };

  await updateProfile(user.id, {
    level: parseLevel(String(formData.get("level") ?? "")),
    specialization: String(formData.get("specialization") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
  return { success: "Profile updated." };
}
