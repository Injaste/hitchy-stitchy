import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ConfigEditorProps } from "@/pages/templates/themes"

const UniqueMuslimConfigEditor = ({ config, onChange }: ConfigEditorProps) => {
  if (config._theme_slug !== "unique-muslim") return null

  return (
    <div className="space-y-2">
      <Label htmlFor="bg-image">Background Image</Label>
      <Input
        id="bg-image"
        placeholder="/image.png or https://..."
        value={config.background_image ?? ""}
        onChange={(e) => onChange({ background_image: e.target.value || null })}
      />
      <p className="text-xs text-muted-foreground">
        Path or URL for the background displayed behind the invitation.
      </p>
    </div>
  )
}

export default UniqueMuslimConfigEditor
