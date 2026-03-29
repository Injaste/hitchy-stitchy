import { motion } from "framer-motion";
import { Edit2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fadeUp } from "@/pages/admin/animations";
import { useTeamModalStore } from "@/pages/admin/store/useTeamModalStore";
import { useUserMutations } from "./queries";
import type { TeamMember } from "./types";

interface Props {
  member: TeamMember;
  index: number;
}

export function UserRow({ member, index }: Props) {
  const { openEditRoleModal } = useTeamModalStore();
  const { toggleAdmin } = useUserMutations();

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp(index * 0.04)}
      className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
            {member.shortRole}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-foreground">{member.names.join(" & ")}</p>
          <p className="text-xs text-muted-foreground">{member.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
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
          size="icon-sm"
          onClick={() => openEditRoleModal(member)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
