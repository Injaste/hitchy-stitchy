import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { TeamCard } from "./TeamCard";

export function TeamTab() {
  const { teamRoles, currentRole } = useAdminStore();
  const { openAddRoleModal } = useModalStore();
  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  return (
    <div className="pb-24 space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg text-foreground">Team Overview</CardTitle>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={openAddRoleModal}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teamRoles.map((member, i) => (
              <TeamCard key={member.role} member={member} index={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
