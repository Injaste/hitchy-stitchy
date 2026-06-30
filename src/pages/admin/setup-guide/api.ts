import { supabase } from "@/lib/supabase";

export interface TutorialState {
  /** The guide is hidden (dismissed). */
  dismissed: boolean;
  /** Ids of steps marked done-on-view (e.g. "access" — a read-only page). */
  viewedSteps: string[];
}

const EMPTY_STATE: TutorialState = { dismissed: false, viewedSteps: [] };

/** Read the event's setup-guide state. RLS restricts the row to the couple
 *  (super-admins). A missing row = the empty state. */
export async function getTutorialState(eventId: string): Promise<TutorialState> {
  const { data, error } = await supabase
    .from("event_tutorial")
    .select("dismissed, viewed_steps")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return EMPTY_STATE;
  return {
    dismissed: !!data.dismissed,
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
      dismissed: state.dismissed,
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
