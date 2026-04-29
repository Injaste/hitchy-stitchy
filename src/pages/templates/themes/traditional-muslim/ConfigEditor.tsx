import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ConfigEditorProps } from "@/pages/templates/themes/types"

const TraditionalMuslimConfigEditor = ({ config, onChange }: ConfigEditorProps) => {
  if (config._theme_slug !== "traditional-muslim") return null

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="bg-image">Background Pattern</Label>
        <Input
          id="bg-image"
          placeholder="/pattern.png or https://..."
          value={config.background_image ?? ""}
          onChange={(e) => onChange({ background_image: e.target.value || null })}
        />
        <p className="text-xs text-muted-foreground">
          Path or URL for the geometric pattern displayed behind the invitation.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ornament-color">Ornament Accent</Label>
        <Input
          id="ornament-color"
          placeholder="#d4af37"
          value={config.ornament_color ?? ""}
          onChange={(e) => onChange({ ornament_color: e.target.value || null })}
        />
        <p className="text-xs text-muted-foreground">
          Hex colour for the gold-leaf ornaments and dividers.
        </p>
      </div>
    </div>
  )
}

export default TraditionalMuslimConfigEditor
