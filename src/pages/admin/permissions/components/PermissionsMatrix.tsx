import type { FC } from "react";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, Eye, Minus, PenLine } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import type { RoleCategory } from "../../types";
import { cn } from "@/lib/utils";

import {
  type CategoryPermissions,
  type AccessLevel,
  type Resource,
  CATEGORY_ORDER,
  CATEGORY_DISPLAY,
  RESOURCE_GROUPS,
  RESOURCE_LABELS,
  deriveAccessLevel,
} from "../types";

interface PermissionsMatrixProps {
  data: CategoryPermissions[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

const ACCESS_CONFIG: Record<
  AccessLevel,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  full: { icon: CheckCircle2, label: "Full", className: "text-primary" },
  write: { icon: PenLine, label: "Edit", className: "text-muted-foreground" },
  read: { icon: Eye, label: "View", className: "text-muted-foreground/60" },
  none: { icon: Minus, label: "—", className: "text-muted-foreground/25" },
};

const AccessCell = ({ level }: { level: AccessLevel }) => {
  const { icon: Icon, label, className } = ACCESS_CONFIG[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {level !== "none" && <span>{label}</span>}
    </span>
  );
};

const MatrixSkeleton = () => (
  <div className="space-y-1">
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} className="h-10 w-full rounded-md" />
    ))}
  </div>
);

const MatrixTable: FC<{ data: CategoryPermissions[] }> = ({ data }) => {
  const permMap = new Map<RoleCategory, Map<Resource, AccessLevel>>();
  for (const cat of data) {
    const resourceMap = new Map<Resource, AccessLevel>();
    for (const perm of cat.permissions) {
      resourceMap.set(perm.resource, deriveAccessLevel(perm));
    }
    permMap.set(cat.category, resourceMap);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground tracking-wide w-[36%]">
              Feature
            </th>
            {CATEGORY_ORDER.map((cat) => {
              const { label, description } = CATEGORY_DISPLAY[cat];
              return (
                <th key={cat} className="px-4 py-3.5 text-left w-[16%]">
                  <span className="block text-xs font-semibold text-foreground">
                    {label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground/70 font-normal mt-0.5 leading-tight">
                    {description}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {RESOURCE_GROUPS.map((group, gi) => (
            <>
              <tr
                key={`group-${gi}`}
                className="border-t border-border/40 bg-muted/20"
              >
                <td
                  colSpan={5}
                  className="px-5 py-2 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/50"
                >
                  {group.label}
                </td>
              </tr>
              {group.resources.map((resource, ri) => (
                <tr
                  key={resource}
                  className={cn(
                    "border-t border-border/30 transition-colors hover:bg-muted/20",
                    ri === group.resources.length - 1 &&
                      "border-b border-border/30",
                  )}
                >
                  <td className="px-5 py-3.5 font-medium text-foreground/90">
                    {RESOURCE_LABELS[resource]}
                  </td>
                  {CATEGORY_ORDER.map((cat) => {
                    const level = permMap.get(cat)?.get(resource) ?? "none";
                    return (
                      <td key={cat} className="px-4 py-3.5">
                        <AccessCell level={level} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>

      <div className="px-5 py-3.5 border-t border-border/40 bg-muted/20 flex flex-wrap items-center gap-x-6 gap-y-2">
        {(
          Object.entries(ACCESS_CONFIG) as [
            AccessLevel,
            (typeof ACCESS_CONFIG)[AccessLevel],
          ][]
        ).map(([level, { icon: Icon, label, className }]) =>
          level !== "none" ? (
            <span
              key={level}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                className,
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ) : (
            <span
              key={level}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                className,
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              No access
            </span>
          ),
        )}
      </div>
    </div>
  );
};

const PermissionsMatrix: FC<PermissionsMatrixProps> = ({
  data,
  isLoading,
  isError,
}) => {
  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <MatrixSkeleton />
        </ComponentFade>
      );

    if (isError || !data)
      return (
        <ComponentFade key="error">
          <p className="text-sm text-muted-foreground py-8 text-center">
            Could not load permission data.
          </p>
        </ComponentFade>
      );

    return (
      <ComponentFade key="content">
        <MatrixTable data={data} />
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default PermissionsMatrix;
