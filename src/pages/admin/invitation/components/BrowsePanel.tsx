import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { parseISO, format } from "date-fns";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { themeRegistry } from "@/pages/wedding/templates";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { dayLabel } from "../../days/utils";
import { useEventDaysQuery } from "../../days/queries";
import {
  useTemplatesQuery,
  useEventInvitationMutations,
  useEventSegmentsQuery,
  useEventInvitationsQuery,
} from "../queries";
import type { EventInvitation, Template } from "../types";

interface BrowsePanelProps {
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onUsed: (invitation: EventInvitation) => void;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Left pane in "browse" mode: template list + the create form (day, optional
// segment, link path). Selection is lifted to the shell so the shared preview
// pane (right) renders it.
const BrowsePanel = ({ selectedSlug, onSelect, onUsed }: BrowsePanelProps) => {
  const { slug } = useAdminStore();
  const { data: templates } = useTemplatesQuery();
  const { data: days } = useEventDaysQuery();
  const { data: segments } = useEventSegmentsQuery();
  const { data: invitations } = useEventInvitationsQuery();
  const { create, eventId } = useEventInvitationMutations();

  const usable = useMemo(
    () => (templates ?? []).filter((t) => themeRegistry[t.slug]),
    [templates],
  );
  const selected: Template | null =
    usable.find((t) => t.slug === selectedSlug) ?? usable[0] ?? null;

  const dayList = days ?? [];
  const segList = segments ?? [];

  const [dayId, setDayId] = useState("");
  const [segmentId, setSegmentId] = useState(""); // "" = day-level (no segment)
  const [linkSlug, setLinkSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  // Seed the shell's template selection so the preview has something to show.
  useEffect(() => {
    if (!selectedSlug && selected) onSelect(selected.slug);
  }, [selectedSlug, selected, onSelect]);

  // Default to the first day.
  useEffect(() => {
    if (!dayId && dayList[0]) setDayId(dayList[0].id);
  }, [dayId, dayList]);

  // Named segments for the chosen day (the default NULL-name segment = day-level).
  const daySegments = useMemo(
    () => segList.filter((s) => s.day_id === dayId && s.name),
    [segList, dayId],
  );

  // Drop a segment selection that doesn't belong to the newly chosen day.
  useEffect(() => {
    if (segmentId && !daySegments.some((s) => s.id === segmentId)) setSegmentId("");
  }, [daySegments, segmentId]);

  // The label the link path derives from: the segment name, else the day label.
  const derivedLabel = useMemo(() => {
    if (segmentId) {
      const s = segList.find((x) => x.id === segmentId);
      if (s?.name?.trim()) return s.name.trim();
    }
    const idx = dayList.findIndex((d) => d.id === dayId);
    return dayLabel(dayList[idx]?.label, idx);
  }, [segmentId, dayId, segList, dayList]);

  // Auto-fill the link path from the label until the user types their own.
  useEffect(() => {
    if (!slugTouched) setLinkSlug(slugify(derivedLabel));
  }, [derivedLabel, slugTouched]);

  const hasRoot = (invitations ?? []).some((i) => i.link_slug === null);
  const trimmedSlug = linkSlug.trim();
  // Empty path = the event root; only allowed if no root exists yet.
  const rootConflict = trimmedSlug === "" && hasRoot;

  const handleUse = () => {
    if (!selected || !eventId || !dayId || rootConflict) return;
    create
      .mutateAsync({
        event_id: eventId,
        template_key: selected.slug,
        day_id: dayId,
        segment_id: segmentId || null,
        link_slug: trimmedSlug || null,
      })
      .then(onUsed)
      .catch(() => {
        // toast handled by the mutation
      });
  };

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {usable.length === 0 && (
          <p className="text-sm text-muted-foreground px-1 py-6">
            No templates available yet.
          </p>
        )}
        {usable.map((t) => {
          const isSel = selected?.slug === t.slug;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.slug)}
              className={cn(
                "w-full text-left flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-colors",
                isSel
                  ? "border-primary ring-3 ring-primary/20"
                  : "border-border hover:border-primary/50",
              )}
            >
              <div className="size-14 shrink-0 rounded-md bg-linear-to-b from-primary/20 to-secondary/15 grid place-items-center font-display text-sm text-foreground/70">
                {t.name.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium font-display truncate">
                  {t.name}
                </h4>
                {t.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {t.description}
                  </p>
                )}
              </div>
              {isSel && <Check className="size-4 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>

      {selected && (
        <>
          <Separator />
          <div className="p-4 space-y-3 bg-background">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Day</Label>
                <Select value={dayId} onValueChange={setDayId}>
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Pick a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayList.map((d, i) => (
                      <SelectItem key={d.id} value={d.id}>
                        {dayLabel(d.label, i)} · {format(parseISO(d.date), "d MMM")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {daySegments.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Segment</Label>
                  <Select
                    value={segmentId || "none"}
                    onValueChange={(v) => setSegmentId(v === "none" ? "" : v)}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Whole day</SelectItem>
                      {daySegments.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Link path</Label>
              <Input
                value={linkSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setLinkSlug(e.target.value);
                }}
                placeholder="e.g. mehndi"
                className="h-9"
              />
              <p
                className={cn(
                  "text-2xs",
                  rootConflict ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {rootConflict
                  ? "A root link already exists — add a path."
                  : `Guests open /${slug}${trimmedSlug ? `/${trimmedSlug}` : ""}`}
              </p>
            </div>

            <SubmitButton
              type="button"
              size="sm"
              onClick={handleUse}
              disabled={create.isPending || !dayId || rootConflict}
              isPending={create.isPending}
              isSuccess={create.isSuccess}
              isError={create.isError}
              className="w-full"
            >
              Use this template
            </SubmitButton>
          </div>
        </>
      )}
    </div>
  );
};

export default BrowsePanel;
