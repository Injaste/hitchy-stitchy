import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useInvitationQuery } from "@/pages/admin/invitation/queries"
import { themeRegistry, FallbackTheme } from "@/pages/invitation/themes"
import type { ThemeConfigField } from "@/pages/invitation/themes"
import type { PublicEventConfig } from "@/pages/invitation/types"
import type { EventPage } from "../types"
import { useUpdatePageConfigMutation } from "../queries"

const PHONE_W = 390
const PREVIEW_SCALE = 0.72
const PREVIEW_W = Math.round(PHONE_W * PREVIEW_SCALE)
const PREVIEW_H = 560

interface Props {
  page: EventPage
  onBack: () => void
}

const ConfigField = ({
  field,
  value,
  onChange,
}: {
  field: ThemeConfigField
  value: string
  onChange: (v: string) => void
}) => (
  <div className="space-y-2">
    <Label>{field.label}</Label>
    <Input
      type={field.type === "color" ? "color" : "text"}
      placeholder={field.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {field.description && (
      <p className="text-xs text-muted-foreground">{field.description}</p>
    )}
  </div>
)

const PageEditor = ({ page, onBack }: Props) => {
  const { data: invitation, isLoading } = useInvitationQuery()
  const [draftConfig, setDraftConfig] = useState<Record<string, unknown>>(page.config)
  const updateConfig = useUpdatePageConfigMutation()

  const themeSlug = (page.config._theme_slug as string) ?? page.theme?.slug ?? null
  const definition = themeSlug ? themeRegistry[themeSlug] : null
  const ThemeComponent = definition?.component ?? FallbackTheme
  const schema = definition?.schema ?? []

  const composed: PublicEventConfig | null = invitation
    ? {
        id: invitation.id,
        event_id: invitation.event_id,
        couple_names: invitation.couple_names,
        event_date: invitation.event_date,
        event_time_start: invitation.event_time_start,
        event_time_end: invitation.event_time_end,
        venue_name: invitation.venue_name,
        venue_address: invitation.venue_address,
        venue_map_embed_url: invitation.venue_map_embed_url,
        venue_map_link: invitation.venue_map_link,
        rsvp_mode: invitation.rsvp_mode as PublicEventConfig["rsvp_mode"],
        rsvp_deadline: invitation.rsvp_deadline,
        config: invitation.config as PublicEventConfig["config"],
        published_page: { id: page.id, theme_slug: themeSlug, config: draftConfig },
      }
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-display font-semibold">{page.name}</h2>
          <p className="text-sm text-muted-foreground">Edit page configuration</p>
        </div>
      </div>

      <div className="flex gap-10 items-start">
        <div className="flex-1 space-y-6 min-w-0">
          {schema.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">This theme has no configurable fields.</p>
          ) : (
            schema.map((field) => (
              <ConfigField
                key={field.key}
                field={field}
                value={(draftConfig[field.key] as string) ?? ""}
                onChange={(v) => setDraftConfig((prev) => ({ ...prev, [field.key]: v }))}
              />
            ))
          )}

          <Button
            size="sm"
            onClick={() => updateConfig.mutate({ id: page.id, config: draftConfig })}
            disabled={updateConfig.isPending || schema.length === 0}
          >
            Save Changes
          </Button>
        </div>

        <div className="shrink-0">
          <p className="text-xs text-muted-foreground mb-2 text-center">Live Preview</p>
          <div
            className="relative overflow-hidden rounded-2xl border bg-background shadow-sm"
            style={{ width: PREVIEW_W, height: PREVIEW_H }}
          >
            {!composed || isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <div
                style={{
                  transform: `scale(${PREVIEW_SCALE})`,
                  transformOrigin: "top left",
                  width: PHONE_W,
                  height: PREVIEW_H / PREVIEW_SCALE,
                  pointerEvents: "none",
                }}
              >
                <ThemeComponent eventConfig={composed} pageConfig={draftConfig} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageEditor
