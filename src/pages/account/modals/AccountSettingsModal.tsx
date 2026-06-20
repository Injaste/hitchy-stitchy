import { useEffect, useState, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleUser,
  KeyRound,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media-query";
import ComponentFade from "@/components/animations/animate-component-fade";

import AccountProfileForm from "../components/AccountProfileForm";
import AccountDangerSection from "../components/AccountDangerSection";
import ChangePassword from "../components/change-password";

// ─── Sections ───────────────────────────────────────────────────────────────
// One registry drives both layouts (desktop rail + mobile master/detail) so the
// content is authored once. Sections render flush (no cards) — the panel/screen
// is the surface.

const SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    icon: CircleUser,
    render: () => <AccountProfileForm />,
  },
  {
    id: "password",
    label: "Password",
    icon: KeyRound,
    render: () => <ChangePassword />,
  },
  {
    id: "account",
    label: "Account",
    icon: ShieldAlert,
    render: () => <AccountDangerSection />,
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

// ─── Desktop: vertical rail + panel inside a wide Dialog ──────────────────────

const DesktopSettings: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [active, setActive] = useState<SectionId>(SECTIONS[0].id);
  const section = SECTIONS.find((s) => s.id === active)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-xl">
        <DialogHeader className="pb-0">
          <DialogTitle>Account settings</DialogTitle>
        </DialogHeader>

        <div className="flex h-112 max-h-[70vh]">
          <nav className="w-44 shrink-0 space-y-1 border-r border-border p-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                data-active={active === s.id}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  "data-[active=true]:bg-secondary/70 data-[active=true]:text-secondary-foreground",
                )}
              >
                <s.icon className="size-4 shrink-0" />
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-4">
            <ComponentFade key={active}>{section.render()}</ComponentFade>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Mobile: full-screen Sheet, master list → detail ──────────────────────────

const MobileSettings: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [active, setActive] = useState<SectionId | null>(null); // null = list
  const section = active ? SECTIONS.find((s) => s.id === active)! : null;

  // Reset to the list each time the sheet closes, so it reopens at the top level.
  useEffect(() => {
    if (!open) setActive(null);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-describedby={undefined}
        className="inset-0 h-dvh w-full max-w-none gap-0 rounded-none p-0"
      >
        <SheetTitle className="sr-only">Account settings</SheetTitle>

        <AnimatePresence mode="popLayout" initial={false}>
          {section === null ? (
            <motion.div
              key="list"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="flex size-full flex-col bg-popover"
            >
              <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
                <h2 className="font-display font-medium text-foreground">
                  Account settings
                </h2>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon-sm">
                    <X />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
              </header>

              <nav className="flex-1 overflow-y-auto p-2">
                {SECTIONS.map((s) => (
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
              className="flex size-full flex-col bg-popover"
            >
              <header className="flex h-14 shrink-0 items-center border-b border-border px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActive(null)}
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

interface AccountSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccountSettingsModal: FC<AccountSettingsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();
  const Settings = isMobile ? MobileSettings : DesktopSettings;
  return <Settings open={open} onOpenChange={onOpenChange} />;
};

export default AccountSettingsModal;
