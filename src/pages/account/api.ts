import { supabase } from "@/lib/supabase"
import type { Profile } from "./types"

// ─── Read ───────────────────────────────────────────────────────────────────

/** The caller's account profile. `name`/`avatar_url` come from the profiles row
 *  (RLS restricts the result to the caller's own), `email` from auth. */
export async function fetchProfile(): Promise<Profile> {
  const [{ data: user }, profile] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("name, avatar_url").maybeSingle(),
  ])
  if (profile.error) throw new Error(profile.error.message)

  return {
    name: profile.data?.name ?? null,
    avatar_url: profile.data?.avatar_url ?? null,
    email: user.user?.email ?? null,
  }
}

// ─── Name ───────────────────────────────────────────────────────────────────

export async function updateProfileName(name: string): Promise<string> {
  const { error } = await supabase.rpc("update_profile_name", { p_name: name })
  if (error) throw new Error(error.message)

  return name;
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
// Bucket + RLS live in 20260618000102_profiles_avatar_storage.sql: public read,
// writes scoped to `avatars/<auth.uid()>/…` by the object path. The path is
// deterministic per user, so a re-upload overwrites in place (no orphans); the
// `?v=` cache-bust is what makes the new image actually show.

const AVATAR_BUCKET = "avatars"
const AVATAR_MAX_EDGE = 512
const WEBP_QUALITY = 0.85

// Center-crop to a square and downscale to a max edge, re-encoded as WebP so
// avatars stay small. Falls back to the original file if it can't be decoded.
async function toSquareWebp(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const edge = Math.min(bitmap.width, bitmap.height)
    const sx = (bitmap.width - edge) / 2
    const sy = (bitmap.height - edge) / 2
    const size = Math.min(edge, AVATAR_MAX_EDGE)

    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, sx, sy, edge, edge, 0, 0, size, size)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    )
    return blob ?? file
  } catch {
    return file
  }
}

/** Upload (and overwrite) the caller's avatar, then point profiles.avatar_url at
 *  it. Returns the new public URL. */
export async function uploadAvatar(file: File): Promise<string> {
  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id
  if (!uid) throw new Error("You must be signed in to upload an avatar.")

  const blob = await toSquareWebp(file)
  const path = `${uid}/avatar.webp`

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, {
      contentType: blob.type,
      cacheControl: "31536000",
      upsert: true,
    })
  if (uploadError) throw new Error(uploadError.message)

  const publicUrl = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data
    .publicUrl
  const versioned = `${publicUrl}?v=${Date.now()}`

  const { error: saveError } = await supabase.rpc("update_profile_avatar", {
    p_avatar_url: versioned,
  })
  if (saveError) throw new Error(saveError.message)

  return versioned
}
