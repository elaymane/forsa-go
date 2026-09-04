import "server-only";
import { put } from "@vercel/blob";

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — fine for logos

export async function uploadFile(
  file: File,
  folder: string,
  allowedTypes: string[],
  maxSize: number = DEFAULT_MAX_FILE_SIZE
): Promise<{ url: string | null; error?: string }> {
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: `That file type isn't accepted. Allowed: ${allowedTypes.join(", ")}.` };
  }
  if (file.size > maxSize) {
    return { url: null, error: `File is too large — max ${Math.round(maxSize / (1024 * 1024))}MB.` };
  }

  try {
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, { access: "public" });
    return { url: blob.url };
  } catch (err) {
    // Log the real cause server-side — the message shown to the user stays
    // generic on purpose, but this is what actually tells us what's wrong
    // instead of always blaming the token regardless of the true reason.
    console.error("Blob upload failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return {
      url: null,
      error: `Couldn't upload the file (${detail}).`,
    };
  }
}

/** Reads a file from FormData under the given field name, if present. Returns null (no error) when the field is empty. */
export async function uploadFieldIfProvided(
  formData: FormData,
  field: string,
  folder: string,
  allowedTypes: string[],
  maxSize?: number
): Promise<{ url: string | null; error?: string }> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return { url: null };
  return uploadFile(file, folder, allowedTypes, maxSize);
}
