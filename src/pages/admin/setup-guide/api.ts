import { supabase } from "@/lib/supabase";

export interface TutorialState {
  /** event_members.id values that have dismissed (hidden) the guide. Dismissal is a
   *  personal preference, so it's per-member, not a shared flag — a member sees the
   *  guide unless their id is listed. */
  dismissedBy: string[];
  /** event_members.id values that have already seen the completion confetti — so it
   *  fires once per person, ever. Per-member like dismissedBy. */
  celebratedBy: string[];
  /** event_members.id values that have minimised the widget to its pill. Per-member
   *  like dismissedBy, so the collapsed state persists across reloads and devices; a
   *  member sees the full panel unless their id is listed. */
  minimisedBy: string[];
  /** Ids of steps marked done-on-view (e.g. "access" — a read-only page). Event-wide
   *  (real setup progress), unlike dismissedBy. */
  viewedSteps: string[];
}

const EMPTY_STATE: TutorialState = {
  dismissedBy: [],
  celebratedBy: [],
  minimisedBy: [],
  viewedSteps: [],
};

/** Read the event's setup-guide state. RLS restricts the row to the couple
 *  (super-admins). A missing row = the empty state. */
export async function getTutorialState(eventId: string): Promise<TutorialState> {
  const { data, error } = await supabase
    .from("event_tutorial")
    .select("dismissed_by, celebrated_by, minimised_by, viewed_steps")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return EMPTY_STATE;
  return {
    dismissedBy: (data.dismissed_by ?? []) as string[],
    celebratedBy: (data.celebrated_by ?? []) as string[],
    minimisedBy: (data.minimised_by ?? []) as string[],
    viewedSteps: (data.viewed_steps ?? []) as string[],
  };
}

/** Upsert the event's full state (we always write both fields so neither write
 *  clobbers the other). Lazy — the first write creates the row. Direct under RLS. */
export async function setTutorialState(
  eventId: string,
  state: TutorialState,
): Promise<TutorialState> {
  const { error } = await supabase.from("event_tutorial").upsert(
    {
      event_id: eventId,
      dismissed_by: state.dismissedBy,
      celebrated_by: state.celebratedBy,
      minimised_by: state.minimisedBy,
      viewed_steps: state.viewedSteps,
    },
    { onConflict: "event_id" },
  );

  if (error) throw new Error(error.message);
  return state;
}

export interface SetupCounts {
  timeline: number;
  tasks: number;
  expenses: number;
  gifts: number;
  invitations: number;
  guests: number;
}

const COUNT_TABLES: Record<keyof SetupCounts, string> = {
  timeline: "event_timelines",
  tasks: "event_tasks",
  expenses: "event_expenses",
  gifts: "event_gifts",
  invitations: "event_invitations",
  guests: "event_rsvps",
};

/** Lightweight existence counts that drive checklist completion for the features
 *  whose state isn't in plan.usage. `head: true` transfers no rows — just the
 *  count. RLS-scoped; the caller only runs this for super-admins. (Access isn't
 *  counted — it's a read-only page, completed via viewed_steps instead.) */
export async function fetchSetupCounts(eventId: string): Promise<SetupCounts> {
  const result: SetupCounts = {
    timeline: 0,
    tasks: 0,
    expenses: 0,
    gifts: 0,
    invitations: 0,
    guests: 0,
  };
  await Promise.all(
    (Object.entries(COUNT_TABLES) as [keyof SetupCounts, string][]).map(
      async ([key, table]) => {
        const { count, error } = await supabase
          .from(table)
          .select("id", { count: "exact", head: true })
          .eq("event_id", eventId);
        if (error) throw new Error(error.message);
        result[key] = count ?? 0;
      },
    ),
  );
  return result;
}
