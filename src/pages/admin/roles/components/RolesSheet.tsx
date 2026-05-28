import { useState } from "react";
import { Plus, Shield } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useRolesQuery } from "../queries";
import { useMembersQuery } from "../../members/queries";
import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { useAccess } from "../../hooks/useAccess";
import { CATEGORY_LABELS } from "../types";

const RolesSheet = () => {
  const [open, setOpen] = useState(false);

  const { data: roles = [] } = useRolesQuery();
  const { data: members = [] } = useMembersQuery();
  const openRoleDetail = useRoleModalStore((s) => s.openDetail);
  const openCreate = useRoleModalStore((s) => s.openCreate);
  const { canCreate } = useAccess();

  const memberCountByRole = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.role_id] = (acc[m.role_id] ?? 0) + 1;
    return acc;
  }, {});

  const assignable = roles.filter((r) => r.category !== "root");

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1"
      >
        <Shield className="w-4 h-4" />
        <span className="hidden sm:inline">Roles</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 overflow-x-hidden"
        >
          <SheetHeader className="px-5 pt-5 pb-4">
            <SheetTitle>Roles</SheetTitle>
            <SheetDescription>
              Manage roles for your event team.
            </SheetDescription>
          </SheetHeader>

          <Separator />

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {assignable.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground text-center">
                No roles yet.
              </p>
            ) : (
              <ul>
                {assignable.map((role, i) => {
                  const count = memberCountByRole[role.id] ?? 0;
                  return (
                    <li key={role.id}>
                      <button
                        onClick={() => openRoleDetail(role)}
                        className="cursor-pointer w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 active:bg-muted transition-colors text-left"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
                          {role.short_name}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {role.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {CATEGORY_LABELS[role.category]}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={cn(
                              "text-xs font-medium tabular-nums",
                              count === 0
                                ? "text-muted-foreground/30"
                                : "text-foreground",
                            )}
                          >
                            {count}
                          </p>
                          <p className="text-2xs text-muted-foreground/40">
                            {count === 1 ? "member" : "members"}
                          </p>
                        </div>
                      </button>
                      {i < assignable.length - 1 && (
                        <Separator className="mx-5" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {canCreate("roles") && (
            <>
              <Separator />
              <div className="px-5 py-4">
                <Button size="sm" className="w-full gap-2" onClick={openCreate}>
                  <Plus className="w-4 h-4" />
                  Role
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default RolesSheet;
