import { motion } from "framer-motion";
import { Bell, Edit2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/pages/admin/animations";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { useUserMutations } from "./queries";
import type { TeamMember } from "./types";

interface Props {
  member: TeamMember;
  index: number;
}

export function UserRow({ member, index }: Props) {
  const { openEditRoleModal, openPingModal } = useModalStore();
  const { toggleAdmin, toggleActive } = useUserMutations();
  const isActive = member.isActive ?? true;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp(index * 0.04)}
      className={cn(
        "p-4 flex items-center justify-between gap-3 transition-colors hover:bg-muted/40",
        !isActive && "opacity-50"
      )}
    >
      {/* Left: avatar + name + role */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
            {member.shortRole}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className={cn("font-bold text-foreground", !isActive && "line-through")}>
            {member.names.join(" & ")}
          </p>
          <p className="text-xs text-muted-foreground truncate">{member.role}</p>
        </div>
        <Badge
          variant={isActive ? "secondary" : "destructive"}
          className="text-[10px] shrink-0"
        >
          {isActive ? "Active" : "Revoked"}
        </Badge>
      </div>

      {/* Right: isActive Switch + Admin checkbox + Ping + Edit */}
      <div className="flex items-center gap-3 shrink-0">
        <Switch
          checked={isActive}
          onCheckedChange={(checked) =>
            toggleActive.mutate({ role: member.role, isActive: checked })
          }
        />
        <div className="flex items-center gap-1.5">
          <Checkbox
            id={`admin-${member.role}`}
            checked={member.isAdmin ?? false}
            onCheckedChange={(checked) =>
              toggleAdmin.mutate({ role: member.role, isAdmin: !!checked })
            }
          />
          <label
            htmlFor={`admin-${member.role}`}
            className="text-xs font-medium text-muted-foreground cursor-pointer"
          >
            Admin
          </label>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => openPingModal(member.role)}
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => openEditRoleModal(member)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
