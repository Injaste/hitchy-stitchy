import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { scaleIn } from "@/pages/admin/animations";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import type { TeamMember } from "./types";

interface Props {
  member: TeamMember;
  index: number;
}

export function TeamCard({ member, index }: Props) {
  const { currentRole, teamRoles } = useAdminStore();
  const { openEditRoleModal } = useModalStore();
  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={scaleIn(index * 0.06)}
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <div
          onClick={() => { if (isAdmin) openEditRoleModal(member); }}
          className={cn(
            "flex flex-col p-3 bg-card border border-border rounded-lg shadow-sm transition-colors",
            isAdmin ? "cursor-pointer hover:bg-muted/50" : ""
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                  {member.shortRole}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-primary text-sm">
                  {member.role} ({member.shortRole})
                </span>
                <span className="text-xs text-muted-foreground">{member.names.join(" & ")}</span>
              </div>
            </div>
            {member.isAdmin && (
              <Badge variant="default" className="text-[10px]">
                Admin
              </Badge>
            )}
          </div>
          {member.description && (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2 mt-1">
              {member.description}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
