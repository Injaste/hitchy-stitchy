import type { FC } from "react";
import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { CATEGORY_LABELS, type Role } from "../types";
import { useAccess } from "../../hooks/useAccess";
import type { Member } from "../../members/types";

interface RoleCardProps {
  role: Role;
  members: Member[];
}

const RoleCard: FC<RoleCardProps> = ({ role, members }) => {
  const openDetail = useRoleModalStore((s) => s.openDetail);
  const { canUpdate, canDelete } = useAccess();

  const canEdit = canUpdate("roles");
  const canRemove = canDelete("roles");

  const activeMembers = members.filter((m) => !m.is_frozen);

  return (
    <Button variant="card" size="free" onClick={() => openDetail(role)}>
      <Card className="h-full">
        <CardContent className="px-5 py-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base text-foreground truncate">
                  {role.name}
                </h3>
                <Badge variant="outline" className="text-2xs tracking-wide">
                  {role.short_name}
                </Badge>
              </div>
              <p className="text-xs tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[role.category]}
              </p>
            </div>
          </div>

          {role.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {role.description}
            </p>
          )}

          <div className="pt-1 space-y-2">
            <div className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>
                {activeMembers.length}{" "}
                {activeMembers.length === 1 ? "member" : "members"}
              </span>
            </div>

            {activeMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeMembers.map((m) => (
                  <span
                    key={m.id}
                    className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                  >
                    {m.display_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Button>
  );
};

export default RoleCard;
