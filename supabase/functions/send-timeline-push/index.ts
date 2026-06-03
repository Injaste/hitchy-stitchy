import { createClient } from "jsr:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

async function sendWebPush(subscription: PushSubscription, payload: string) {
  const { default: webpush } = await import("npm:web-push");
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  await webpush.sendNotification(subscription, payload);
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    console.log("payload:", JSON.stringify(body));
    const record = body.record;
    const oldRecord = body.old_record;

    // Only fire when started_at just became non-null (item went live)
    const justStarted = record?.started_at && (!oldRecord || !oldRecord.started_at);
    console.log("justStarted:", justStarted, "started_at:", record?.started_at, "old started_at:", oldRecord?.started_at);
    if (!justStarted) {
      return new Response("No meaningful change", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("event_id", record.event_id);

    if (error) throw error;
    if (!subscriptions?.length) {
      return new Response("No subscribers", { status: 200 });
    }

    const notificationPayload = JSON.stringify({
      title: record.label ?? record.title,
      body: `${record.title} has started`,
      data: {
        event_id: record.event_id,
        timeline_id: record.id,
      },
    });

    const results = await Promise.allSettled(
      subscriptions.map((s) =>
        sendWebPush(s.subscription as unknown as PushSubscription, notificationPayload)
      ),
    );

    // Clean up expired/unsubscribed devices (410 = subscription no longer valid)
    const expired = results
      .map((r, i) => ({ r, sub: subscriptions[i] }))
      .filter(({ r }) => r.status === "rejected" && (r as PromiseRejectedResult).reason?.statusCode === 410);

    if (expired.length) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("subscription", expired.map(({ sub }) => sub.subscription));
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
});
