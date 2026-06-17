import { supabase } from "@/lib/supabase"

// Storage helpers for couple-uploaded theme images. The bucket + RLS live in
// migration 20260613000101_invitation_image_uploads.sql; writes are gated on
// has_event_permission(event_id, 'invitation', 'update') via the object path
// (repointed off the retired 'themes' resource in 20260617000008).
const BUCKET = "invitation-images"
const MAX_EDGE = 1600
const WEBP_QUALITY = 0.85

// Downscale to a max longest-edge and re-encode as WebP so invite pages stay
// fast and phone photos fit the bucket's 5MB cap. Returns the original file
// untouched if it can't be decoded (unsupported format, decode failure).
async function downscale(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    )
    return blob ?? file
  } catch {
    return file
  }
}

// The storage path for one image field. DETERMINISTIC per field — so a field
// always maps to a single object and re-uploading overwrites it (no orphans,
// no accumulation). The first folder segment is the event_id, which the RLS
// write policies read for authorization.
function objectPath(eventId: string, themeId: string, fieldKey: string, ext: string) {
  return `${eventId}/${themeId}/${fieldKey}.${ext}`
}

// Parse the storage object path back out of a public URL (dropping any cache-
// bust query). Returns null for URLs that aren't ours (e.g. a legacy pasted URL).
function pathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  const path = publicUrl.slice(idx + marker.length).split("?")[0]
  return path || null
}

// Upload (and overwrite) the image for one field. Returns its public URL with a
// cache-busting version param — the deterministic path means the URL is stable
// across re-uploads, so `?v=` is what makes the new image actually show.
export async function uploadInvitationImage(
  eventId: string,
  themeId: string,
  fieldKey: string,
  file: File,
  prevUrl?: string | null,
): Promise<string> {
  const blob = await downscale(file)
  const ext = blob.type === "image/webp" ? "webp" : file.name.split(".").pop() || "img"
  const path = objectPath(eventId, themeId, fieldKey, ext)

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
    upsert: true,
  })
  if (error) throw new Error(error.message)

  // Clean up a prior object only if it sits at a DIFFERENT path (ext change, or
  // a legacy uuid-path upload) — same-path uploads already overwrote it.
  const prevPath = prevUrl ? pathFromPublicUrl(prevUrl) : null
  if (prevPath && prevPath !== path) {
    await supabase.storage.from(BUCKET).remove([prevPath])
  }

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  return `${publicUrl}?v=${Date.now()}`
}

// Delete a previously-uploaded object given its public URL. No-op for URLs that
// don't belong to our bucket (e.g. a legacy pasted URL), so it's safe to call
// on any prior field value. Used when a field is cleared.
export async function deleteInvitationImage(publicUrl: string): Promise<void> {
  const path = pathFromPublicUrl(publicUrl)
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}
