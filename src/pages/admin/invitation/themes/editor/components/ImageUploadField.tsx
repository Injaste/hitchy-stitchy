import { useRef, useState, type ReactNode } from "react"
import { ImagePlus, RefreshCw, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import FieldShell from "@/components/custom/form/fields/FieldShell"

import { uploadInvitationImage, deleteInvitationImage } from "../lib/storage"

// What the "internal" variant hands its render-prop so a caller can build its
// own trigger while reusing all the upload mechanics + state.
export interface ImageUploadControl {
  /** Current image URL ("" when empty). */
  value: string
  isUploading: boolean
  /** Open the file picker. */
  open: () => void
  /** Remove the current image. */
  clear: () => void
}

interface ImageUploadFieldProps {
  name: string
  label?: ReactNode
  hint?: ReactNode
  eventId: string
  themeId: string
  /**
   * "default" — built-in dropzone + preview/replace/remove (current design).
   * "internal" — you render the trigger via `children`; the field owns upload,
   * state, preview value, and the animated error.
   */
  variant?: "default" | "internal"
  children?: (control: ImageUploadControl) => ReactNode
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif"
// Sanity gate on the *original* file before we decode it; downscale re-encodes
// to WebP and brings it well under the bucket's 5MB cap.
const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024

const ImageUploadField = ({
  name,
  label,
  hint,
  eventId,
  themeId,
  variant = "default",
  children,
}: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <FieldShell name={name} label={label} hint={hint} error={error}>
      {(field, hasError) => {
        const value = (field.state.value as string | null) ?? ""

        const handleFile = async (file: File) => {
          setError(null)
          if (!file.type.startsWith("image/")) {
            setError("Please choose an image file.")
            return
          }
          if (file.size > MAX_ORIGINAL_BYTES) {
            setError("That image is too large — try one under 20MB.")
            return
          }

          setIsUploading(true)
          try {
            // Deterministic per-field path: overwrites this field's existing
            // object (and cleans up any prior at a different path).
            const url = await uploadInvitationImage(eventId, themeId, name, file, value)
            field.handleChange(url)
          } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed.")
          } finally {
            setIsUploading(false)
          }
        }

        const handleRemove = async () => {
          setError(null)
          const prev = value
          field.handleChange("")
          if (prev) await deleteInvitationImage(prev)
        }

        const openPicker = () => inputRef.current?.click()

        const fileInput = (
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = "" // allow re-picking the same file
            }}
          />
        )

        // "internal": caller renders the trigger; we own everything else.
        if (variant === "internal" && children) {
          return (
            <>
              {fileInput}
              {children({ value, isUploading, open: openPicker, clear: handleRemove })}
            </>
          )
        }

        // "default": built-in dropzone + preview.
        return (
          <div className="flex flex-col gap-2">
            {fileInput}

            {value ? (
              <div className="flex items-center gap-3">
                <img
                  src={value}
                  alt=""
                  className={cn(
                    "h-16 w-16 rounded-lg border border-border object-cover bg-muted transition-[color,box-shadow]",
                    hasError && "border-destructive ring-3 ring-destructive/70",
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openPicker}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={isUploading ? undefined : openPicker}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFile(file)
                }}
                role="button"
                tabIndex={0}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center text-sm transition-[color,box-shadow]",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/20 hover:bg-muted/40",
                  isUploading && "pointer-events-none opacity-70",
                  hasError && "border-destructive ring-3 ring-destructive/70",
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Uploading…</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4 text-muted-foreground/70" />
                    <span className="text-muted-foreground">
                      Drop an image here, or click to upload
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )
      }}
    </FieldShell>
  )
}

export default ImageUploadField
