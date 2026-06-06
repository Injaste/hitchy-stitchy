import { ShieldOff, SnowflakeIcon } from "lucide-react";
import Logo from "@/components/custom/logo";
import BackLink from "@/components/custom/back-link";

interface AdminErrorLayoutProps {
  errorMessage: string;
  isOffline?: boolean;
}

type LockoutKind = "suspended" | "removed" | "generic";

function getLockoutKind(message: string): LockoutKind {
  if (message.startsWith("MEMBER_SUSPENDED:")) return "suspended";
  if (message.startsWith("MEMBER_REMOVED:")) return "removed";
  return "generic";
}

const LOCKOUT_CONTENT: Record<
  LockoutKind,
  { icon: React.ElementType; title: string; description: string; hint?: string }
> = {
  suspended: {
    icon: SnowflakeIcon,
    title: "Access suspended",
    description:
      "Your access to this event has been temporarily suspended. Contact the organizer to restore it.",
    hint: "Refresh the page once your access is restored.",
  },
  removed: {
    icon: ShieldOff,
    title: "Access removed",
    description:
      "Your access to this event has been removed. Contact the organizer if you believe this is a mistake.",
  },
  generic: {
    icon: ShieldOff,
    title: "Unable to load event",
    description: "",
  },
};

const AdminErrorLayout = ({ errorMessage, isOffline }: AdminErrorLayoutProps) => {
  const kind = isOffline ? "generic" : getLockoutKind(errorMessage);
  const content = LOCKOUT_CONTENT[kind];
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {kind === "generic" ? (
          <Logo imageClassName="w-24 h-24 -mb-6" className="mx-auto mb-4" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-6">
            <Icon className="w-9 h-9 text-muted-foreground" />
          </div>
        )}

        <h2 className="text-lg font-semibold text-foreground mb-2">
          {isOffline ? "You're offline" : content.title}
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          {isOffline
            ? "Please check your connection. We'll reload automatically once you're back online."
            : kind === "generic"
              ? errorMessage
              : content.description}
        </p>

        {content.hint && !isOffline && (
          <p className="text-xs text-muted-foreground">{content.hint}</p>
        )}

        {kind === "generic" && !isOffline && (
          <p className="text-xs text-muted-foreground">
            Please contact support if this issue persists.
          </p>
        )}

        {/* Every non-offline state denies access to *this* event (lockout or an
            unexpected bootstrap error), so the only useful action is to leave for
            the dashboard and their other events. Offline is excluded: it
            self-recovers on reconnect, and the dashboard would fail to load while
            offline anyway. */}
        {!isOffline && (
          <div className="mt-6">
            <BackLink to="/dashboard" label="Back to dashboard" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminErrorLayout;
