import { useEffect, useState, type FC } from "react";
import { format } from "date-fns";
import { GalleryVerticalEnd, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { Feedback } from "@dnd-kit/dom";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";

import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/lib/utils/utils-time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/custom/form/SubmitButton";
import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { ScrollView } from "@/components/custom/scroll-view";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { TimelineGroupedDay, TimelineGroupedSegment } from "../types";
import { segmentItems } from "../utils";
import { useAccess } from "../../hooks/useAccess";
import { useAdminStore } from "../../store/useAdminStore";
import { useSegmentMutations } from "../queries";

const sensors = [
  PointerSensor.configure({
    activatorElements: (source) => [source.handle ?? source.element],
  }),
  KeyboardSensor,
];

interface SortableRowProps {
  id: string;
  index: number;
  segment: TimelineGroupedSegment;
  canReorder: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  failed: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
}

const SortableSegmentRow: FC<SortableRowProps> = ({
  id,
  index,
  segment,
  canReorder,
  canUpdate,
  canDelete,
  failed,
  onRename,
  onDelete,
}) => {
  const { ref, handleRef, isDragging } = useSortable({
    id,
    index,
    type: "item",
    accept: "item",
    transition: { duration: 200, easing: "ease" },
  });

  const [name, setName] = useState(segment.name ?? "");
  useEffect(() => setName(segment.name ?? ""), [segment.name]);
  const count = segmentItems(segment).length;

  const commit = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === (segment.name ?? "")) {
      setName(segment.name ?? "");
      return;
    }
    onRename(trimmed);
  };

  // Mirror the Tasks board: the source row dims in place while a clone follows
  // the pointer (carrying the success ring); a rejected reorder flashes the
  // destructive ring as the row animates back to its slot.
  return (
    <div
      ref={ref}
      data-dragging={isDragging || undefined}
      className="data-dragging:opacity-50"
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg border border-border bg-card p-1.5 shadow-xs transition-shadow",
          isDragging && "ring-2 ring-success shadow-lg",
          failed && "ring-2 ring-destructive",
        )}
      >
        <Button
          ref={handleRef}
          variant="ghost"
          size="icon-sm"
          className="cursor-grab touch-none text-muted-foreground"
          disabled={!canReorder}
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </Button>

        <Input
          value={name}
          disabled={!canUpdate}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="Schedule"
          className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0 pl-0"
        />

        {count > 0 && (
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground tabular-nums">
            {count}
          </span>
        )}

        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label="Delete segment"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

interface SegmentsSheetProps {
  day: TimelineGroupedDay;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Manage a day's segments — add, rename, delete (non-last), drag to reorder. */
const SegmentsSheet: FC<SegmentsSheetProps> = ({ day, open, onOpenChange }) => {
  const { eventId } = useAdminStore();
  const { canCreate, canUpdate, canDelete } = useAccess();
  const { create, update, remove, reorder } = useSegmentMutations();

  const segmentsById = new Map(day.segments.map((s) => [s.id, s]));
  const baseOrder = day.segments.map((s) => s.id);
  const [order, setOrder] = useState<string[]>(baseOrder);
  const [dragging, setDragging] = useState(false);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<TimelineGroupedSegment | null>(null);
  const [newName, setNewName] = useState("");

  // Re-sync from the cache whenever segments change and we're not mid-drag.
  useEffect(() => {
    if (!dragging) setOrder(day.segments.map((s) => s.id));
  }, [day.segments, dragging]);

  const onDragEnd = (event: DragEndEvent) => {
    setDragging(false);
    if (event.canceled || !eventId) {
      setOrder(baseOrder);
      return;
    }
    const draggedId = String(event.operation.source?.id ?? "");
    reorder.mutate(
      { event_id: eventId, day_id: day.day_id, ids: order },
      {
        // Flash the destructive ring while the cache revert animates the row back.
        onError: () => {
          setFailedId(draggedId);
          setTimeout(() => setFailedId(null), 700);
        },
      },
    );
  };

  const addSegment = () => {
    const trimmed = newName.trim();
    if (!trimmed || !eventId) return;
    create.mutate(
      { event_id: eventId, day_id: day.day_id, name: trimmed },
      { onSuccess: () => setNewName("") },
    );
  };

  const canReorder = order.length > 1 && canUpdate("timeline");
  const canDeleteRow = order.length > 1 && canDelete("timeline");

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full bg-gradient-surface sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GalleryVerticalEnd className="size-4" />
              </span>
              Segments
            </SheetTitle>
            <SheetDescription>
              {day.segments.length}{" "}
              {day.segments.length === 1 ? "segment" : "segments"} on{" "}
              {format(parseLocalDate(day.date), "EEEE, do MMMM yyyy")}
            </SheetDescription>
          </SheetHeader>

          <ScrollView className="space-y-2 px-4 py-2">
            <DragDropProvider
              modifiers={[RestrictToVerticalAxis]}
              plugins={(defaults) => [
                ...defaults.filter((p) => p !== Feedback),
                Feedback.configure({ feedback: "clone" }),
              ]}
              sensors={sensors}
              onDragStart={() => setDragging(true)}
              onDragOver={(e) => setOrder((prev) => move(prev, e))}
              onDragEnd={onDragEnd}
            >
              {order.map((id, index) => {
                const segment = segmentsById.get(id);
                if (!segment) return null;
                return (
                  <SortableSegmentRow
                    key={id}
                    id={id}
                    index={index}
                    segment={segment}
                    canReorder={canReorder}
                    canUpdate={canUpdate("timeline")}
                    canDelete={canDeleteRow}
                    failed={id === failedId}
                    onRename={(name) =>
                      eventId && update.mutate({ event_id: eventId, id, name })
                    }
                    onDelete={() => setPendingDelete(segment)}
                  />
                );
              })}
            </DragDropProvider>
          </ScrollView>

          {canCreate("timeline") && (
            <div className="flex items-center gap-2 border-t p-4">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSegment();
                }}
                placeholder="New segment… e.g. Reception"
              />
              <SubmitButton
                type="button"
                size="sm"
                isPending={create.isPending}
                isSuccess={create.isSuccess}
                isError={create.isError}
                onClick={addSegment}
                disabled={!newName.trim()}
              >
                <Plus className="size-4" /> Add
              </SubmitButton>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmAlertModal
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        variant="destructive"
        title="Delete segment?"
        description={
          pendingDelete && segmentItems(pendingDelete).length
            ? `The ${segmentItems(pendingDelete).length} item${segmentItems(pendingDelete).length > 1 ? "s" : ""} in “${pendingDelete.name ?? "Schedule"}” will move to the previous segment.`
            : `“${pendingDelete?.name ?? "Schedule"}” will be removed.`
        }
        confirmLabel="Delete segment"
        onConfirm={() =>
          pendingDelete &&
          eventId &&
          remove.mutate(
            {
              event_id: eventId,
              id: pendingDelete.id,
              name: pendingDelete.name,
            },
            { onSuccess: () => setPendingDelete(null) },
          )
        }
        isPending={remove.isPending}
      />
    </>
  );
};

export default SegmentsSheet;
