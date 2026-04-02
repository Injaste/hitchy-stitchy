import { motion } from "framer-motion";
import { Calendar, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { useCueStore } from "@/pages/planner/store/useCueStore";
import { useAdminStore } from "@/pages/planner/store/useAdminStore";

interface Props {
  activeCategory: string;
  onCategoryChange: (category: string, defaultTab: string) => void;
}

export function CategoryNav({ activeCategory, onCategoryChange }: Props) {
  const { activeCueEvent } = useCueStore();
  const { teamRoles, currentRole } = useAdminStore();
  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  const navItems = [
    {
      id: "timeline",
      label: "Timeline",
      icon: Calendar,
      defaultTab: "day-1",
    },
    {
      id: "ops",
      label: "Operations",
      icon: LayoutDashboard,
      defaultTab: "checklists",
      badge: activeCueEvent ? true : false,
    },
    ...(isAdmin
      ? [
          {
            id: "admin",
            label: "Admin",
            icon: ShieldCheck,
            defaultTab: "rsvps",
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-wrap justify-center mb-6 gap-2 px-2">
      {navItems.map(({ id, label, icon: Icon, defaultTab, badge }) => {
        const active = activeCategory === id;
        return (
          <motion.div
            key={id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              onClick={() => onCategoryChange(id, defaultTab)}
              className={cn(
                "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-sm font-bold gap-1.5 md:gap-2 relative",
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {label}
              {badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
