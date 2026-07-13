import { useIsMobile } from "@/hooks/use-media-query";
import { isMac } from "@/lib/utils";
import ArraySeparator from "@/components/custom/array-separator";

// Static reference cards — how to use the app, not a setup milestone. No
// completion tracking and no coupling to the setup guide's event_tutorial row.
// All-members: shortcuts and navigation apply to everyone.

const mod = isMac ? "⌘" : "Ctrl";

const SHORTCUTS = [
  { label: "Show or hide the sidebar", keys: [mod, "B"] },
  { label: "Save the form you're editing", keys: [mod, "Enter"] },
];

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex min-w-5 items-center justify-center rounded-sm border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
    {children}
  </kbd>
);

const TipsSection = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Keyboard shortcuts are meaningless on touch — desktop only. */}
      {!isMobile && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Keyboard shortcuts</h3>
          <div className="space-y-2">
            {SHORTCUTS.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm">{s.label}</span>
                <ArraySeparator
                  items={s.keys.map((key) => <Kbd key={key}>{key}</Kbd>)}
                  separator={
                    <span className="text-xs text-muted-foreground">+</span>
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3 border-t pt-4">
        <h3 className="text-sm font-semibold">Getting around</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Event settings</span>{" "}
            — open the <span className="font-medium text-foreground">Event settings</span>{" "}
            entry in the sidebar (where you are now).
          </p>
          <p>
            <span className="font-medium text-foreground">Account settings</span>{" "}
            — open the menu with your name at the bottom of the sidebar, then choose{" "}
            <span className="font-medium text-foreground">Account settings</span>.
          </p>
          <p>
            <span className="font-medium text-foreground">Switch events</span> — from
            that same menu, choose <span className="font-medium text-foreground">Dashboard</span>{" "}
            to see all your events.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TipsSection;
