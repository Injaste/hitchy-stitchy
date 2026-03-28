import { CalendarHeart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveCueBanner } from "./ActiveCueBanner";

const SECTION_LABELS: Record<string, string> = {
  timeline: "Timeline",
  ops: "Operations",
  admin: "Admin Panel",
};

interface AdminHeaderProps {
  /** Currently active top-level category — drives the desktop section title */
  activeCategory: string;
  /** Opens the mobile sidebar Sheet */
  onMobileMenuOpen: () => void;
}

/**
 * Slim topbar.
 *
 * Desktop (md+):
 *   - ActiveCueBanner (animates in/out)
 *   - Section title only — role selector + logout live in the sidebar
 *
 * Mobile (<md):
 *   - ActiveCueBanner
 *   - Logo on the left, hamburger on the right to open the sidebar Sheet
 */
export function AdminHeader({ activeCategory, onMobileMenuOpen }: AdminHeaderProps) {
  const sectionLabel = SECTION_LABELS[activeCategory] ?? "Dashboard";

  return (
    <div>
      {/* Cue banner sits above the topbar row — animates in/out via its own AnimatePresence */}
      <ActiveCueBanner />

      <div className="px-4 py-3 flex items-center justify-between min-h-[52px]">
        {/* ── Desktop: section title ── */}
        <p className="hidden md:block text-sm font-medium text-foreground/80 font-serif tracking-wide">
          {sectionLabel}
        </p>

        {/* ── Mobile: brand mark ── */}
        <div className="flex items-center gap-2 md:hidden">
          <CalendarHeart className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-base font-serif font-bold text-primary leading-none">
              Dan &amp; Nad
            </h1>
            <p className="text-[8px] uppercase tracking-widest text-muted-foreground">
              Wedding Planning
            </p>
          </div>
        </div>

        {/* ── Mobile: hamburger ── */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop right side intentionally empty — sidebar owns role + logout */}
        <div className="hidden md:block" />
      </div>
    </div>
  );
}
