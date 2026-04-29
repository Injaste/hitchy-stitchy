import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ConfigEditorProps } from "@/pages/templates/themes/types"

const MinimalisticMuslimConfigEditor = ({ config, onChange }: ConfigEditorProps) => {
  if (config._theme_slug !== "minimalistic-muslim") return null

  return (
    <div className="space-y-2">
      <Label htmlFor="accent-label">Accent Label</Label>
      <Input
        id="accent-label"
        placeholder="A Quiet Celebration"
        value={config.accent_label ?? ""}
        onChange={(e) => onChange({ accent_label: e.target.value || null })}
      />
      <p className="text-xs text-muted-foreground">
        Optional small caption shown above the names in the hero.
      </p>
    </div>
  )
}

export default MinimalisticMuslimConfigEditor
