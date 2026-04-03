import { useState } from "react";
import { Search, ShieldCheck, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { UserRow } from "./UserRow";

export function UsersTab() {
  const [search, setSearch] = useState("");
  const { teamRoles } = useAdminStore();
  const { openAddRoleModal } = useModalStore();

  const filtered = teamRoles.filter(
    (m) =>
      m.names.some((n) => n.toLowerCase().includes(search.toLowerCase())) ||
      m.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-24">
      <Card className="border-border">
        <CardHeader className="pb-3 space-y-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Team Access Control</CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((member, i) => (
                  <div key={member.role}>
                    <UserRow member={member} index={i} />
                    {i < filtered.length - 1 && <Separator />}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground italic text-sm">
                  No team members found matching "{search}"
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={openAddRoleModal}
        className="w-full py-4 border-2 border-dashed gap-2 text-muted-foreground hover:text-primary hover:border-primary/40"
      >
        <UserPlus className="h-5 w-5" />
        Add New Team Member / Role
      </Button>
    </div>
  );
}
