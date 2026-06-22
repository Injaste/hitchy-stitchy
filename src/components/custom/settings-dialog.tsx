import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronLeft, X, type LucideIcon } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollView } from "@/components/custom/scroll-view";
import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useIsMobile } from "@/hooks/use-media-query";

// ─── Unsaved-edit guard ───────────────────────────────────────────────────────
// A section registers its dirty state here so the dialog can intercept a
// tab-switch or close and confirm before discarding. Most settings auto-save;
// this exists for the few with an explicit Save (e.g. the password form). A
// section opts in by calling useSettingsLeaveGuard(isDirty); outside a dialog the
// context is null and it's a no-op.
const SettingsGuardContext = createContext<{
  setDirty: (dirty: boolean) => void;
} | null>(null);

export function useSettingsLeaveGuard(isDirty: boolean) {
  const ctx = useContext(SettingsGuardContext);
  useEffect(() => {
    ctx?.setDirty(isDirty);
    return () => ctx?.setDirty(false);
  }, [ctx, isDirty]);
}

// ─── Settings dialog ──────────────────────────────────────────────────────────
// One responsive shell for any "vertical-tab settings" surface: a wide Dialog
// with a vertical rail on desktop, a full-screen master→detail Sheet on mobile.
// Authored once from a `sections` registry; the active section is fully
// controlled via value/onValueChange (a store owns it — see createSettingsStore).
//
// Active section semantics: `undefined` means "no section chosen" — desktop
// falls back to the first section (and highlights it), mobile shows the master
// list. A concrete id shows that section's detail on both.

export interface SettingsSection {
  id: string;
  label: string;
  icon: LucideIcon;
  render: () => ReactNode;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  sections: readonly SettingsSection[];
  /** Active section (controlled). `undefined` = mobile list / first desktop tab. */
  value?: string;
  /** Fires with a section id, or `undefined` on mobile "back" to the list. */
  onValueChange?: (id: string | undefined) => void;
}

// ─── Desktop: vertical rail + panel inside a wide Dialog ──────────────────────

const DesktopSettings: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  sections: readonly SettingsSection[];
  active: string | undefined;
  setActive: (id: string | undefined) => void;
}> = ({ open, onOpenChange, title, sections, active, setActive }) => {
  // Desktop always has a section selected — fall back to the first.
  const activeId = active ?? sections[0].id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-xl">
        {/* Vertical Tabs: Radix gives roving focus + Up/Down arrow nav + tab
            roles; the list carries the vertical slide indicator. The panel owns
            its own close button + scroll, so the X sits clear of the scrollbar.
            NOTE: do NOT add overflow-hidden + rounded here — an overflow-hidden +
            border-radius ancestor clips the panel's scrollbar in some Chromium
            builds. The dialog's own rounded surface already shows behind the
            transparent rail/panel, so no clipping is needed. */}
        <Tabs
          orientation="vertical"
          value={activeId}
          onValueChange={setActive}
          className="h-112 max-h-[70vh] gap-0 overflow-hidden rounded-xl px-2"
          contentClassName="grid min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)]"
        >
          <TabsList
            variant="line"
            className="w-44 shrink-0 justify-start gap-1 rounded-none border-r border-border p-2 group-data-vertical/tabs:h-full"
          >
            <DialogTitle className="w-full pt-1 pb-2 text-left text-xs font-medium text-muted-foreground">
              {title}
            </DialogTitle>
            {sections.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className="gap-2 py-1.5">
                <s.icon className="size-4 shrink-0" />
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((s) => (
            <TabsContent key={s.id} value={s.id}>
              <div className="h-10" />
              <ScrollView
                gradientTop
                gradientBottom
                gradientClass="from-popover"
                className="px-4 pb-4 pt-1"
              >
                {s.render()}
              </ScrollView>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// ─── Mobile: full-screen Sheet, master list → detail ──────────────────────────

const MobileSettings: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  sections: readonly SettingsSection[];
  active: string | undefined;
  setActive: (id: string | undefined) => void;
}> = ({ open, onOpenChange, title, sections, active, setActive }) => {
  const section = active
    ? (sections.find((s) => s.id === active) ?? null)
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-describedby={undefined}
        className="inset-0 h-dvh w-full max-w-none gap-0 rounded-none p-0"
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>

        <AnimatePresence mode="popLayout" initial={false}>
          {section === null ? (
            <motion.div
              key="list"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="flex size-full flex-col bg-gradient-surface"
            >
              <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
                <h2 className="font-display font-medium text-foreground">
                  {title}
                </h2>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon-sm">
                    <X />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
              </header>

              <nav className="flex-1 overflow-y-auto p-2">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActive(s.id)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-3 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-3">
                      <s.icon className="size-4 shrink-0 text-muted-foreground" />
                      {s.label}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                ))}
              </nav>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2 }}
              className="flex size-full flex-col bg-gradient-surface"
            >
              <header className="flex h-14 shrink-0 items-center border-b border-border px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActive(undefined)}
                  className="gap-1 px-2 font-display font-medium text-foreground"
                >
                  <ChevronLeft />
                  {section.label}
                </Button>
              </header>

              <div className="flex-1 overflow-y-auto p-4">
                {section.render()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

// ─── Responsive shell ─────────────────────────────────────────────────────────

const SettingsDialog: FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  title,
  sections,
  value,
  onValueChange,
}) => {
  const isMobile = useIsMobile();
  const [dirty, setDirty] = useState(false);
  // The action (switch tab / close) held back until the user resolves the
  // unsaved-changes prompt. `null` = no prompt open.
  const [pending, setPending] = useState<(() => void) | null>(null);

  // Purely controlled: the caller's store owns `section` (and its reset on
  // close). We must NOT treat `value === undefined` as "uncontrolled" — undefined
  // is a real state here (the mobile list / first desktop tab), and conflating
  // the two made mobile "back" need two presses (store cleared, but a stale
  // internal copy kept the detail view until a second tap).
  const setActive = useCallback(
    (id: string | undefined) => onValueChange?.(id),
    [onValueChange],
  );

  // Guard leaving a dirty section — switching to a different tab, or closing.
  const guardedSetActive = useCallback(
    (id: string | undefined) => {
      if (dirty && id !== value) setPending(() => () => setActive(id));
      else setActive(id);
    },
    [dirty, value, setActive],
  );
  const guardedOpenChange = useCallback(
    (next: boolean) => {
      if (!next && dirty) setPending(() => () => onOpenChange(false));
      else onOpenChange(next);
    },
    [dirty, onOpenChange],
  );

  // Browser-level guard (refresh / tab close / address bar) while dirty.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const guard = useMemo(() => ({ setDirty }), [setDirty]);

  const Settings = isMobile ? MobileSettings : DesktopSettings;
  return (
    <SettingsGuardContext.Provider value={guard}>
      <Settings
        open={open}
        onOpenChange={guardedOpenChange}
        title={title}
        sections={sections}
        active={value}
        setActive={guardedSetActive}
      />
      <ConfirmAlertModal
        open={pending !== null}
        onOpenChange={(o) => {
          if (!o) setPending(null);
        }}
        variant="warning"
        title="Discard unsaved changes?"
        description="Your edits here haven't been saved and will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onConfirm={() => {
          const action = pending;
          setDirty(false);
          setPending(null);
          action?.();
        }}
      />
    </SettingsGuardContext.Provider>
  );
};

export default SettingsDialog;
