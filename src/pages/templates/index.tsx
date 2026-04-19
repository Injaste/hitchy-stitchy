import { motion } from "framer-motion";
import { CalendarHeart } from "lucide-react";

import { usePublicEvent, usePublicEventRealtime } from "./queries";
import { themeRegistry, FallbackTheme } from "./themes";

const InvitationSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen bg-background flex items-center justify-center"
  >
    <CalendarHeart className="w-10 h-10 text-primary animate-pulse" />
  </motion.div>
);

const InvitationError = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-4">
    <p className="text-sm text-muted-foreground italic">
      This invitation could not be found.
    </p>
  </div>
);

const Invitation = () => {
  const { data: eventConfig, isLoading, error } = usePublicEvent();
  usePublicEventRealtime(eventConfig?.event_id ?? null);

  if (isLoading) return <InvitationSkeleton />;
  if (error || !eventConfig) return <InvitationError />;

  const themeSlug = eventConfig.published_page?.theme_slug ?? null;
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug] : null) ?? FallbackTheme;

  return (
    <ThemeComponent
      eventConfig={eventConfig}
      pageConfig={eventConfig.published_page?.config}
    />
  );
};

export default Invitation;
