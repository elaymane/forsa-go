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
  } catch {
    return {
      url: null,
      error: "Couldn't upload the file — make sure BLOB_READ_WRITE_TOKEN is set up (see .env.example).",
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
