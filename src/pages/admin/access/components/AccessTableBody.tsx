import { Fragment, useMemo, type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AccessGroup, Resource } from "../types";
import { RESOURCE_GROUPS, RESOURCE_LABELS, getLevel } from "../types";
import LevelBadge from "./LevelBadge";

const RESOURCE_HINTS: Partial<Record<Resource, React.ReactNode>> = {
  tasks: (
    <ul className="space-y-1">
      <li>
        <span className="font-medium">Full —</span> drag, create, edit, delete
        and archive all tasks
      </li>
      <li>
        <span className="font-medium">View —</span> see all tasks; can still
        edit and manage tasks you created or are assigned to (no drag)
      </li>
      <li>
        <span className="font-medium">None —</span> tasks hidden entirely
      </li>
    </ul>
  ),
  gifts: (
    <ul className="space-y-0.5">
      <li>
        <span className="font-medium">Ang Bao (红包) —</span> Chinese red packet
      </li>
      <li>
        <span className="font-medium">Sampul Duit —</span> Malay
      </li>
      <li>
        <span className="font-medium">Shagun —</span> Indian
      </li>
    </ul>
  ),
};

/** Resource/feature name cell — a dotted-underline tooltip when a hint exists,
 *  plain text otherwise. Shared by grantable resources and the static rows. */
const LabelCell: FC<{ label: ReactNode; hint?: ReactNode }> = ({
  label,
  hint,
}) => (
  <td className="px-5 py-3.5 font-medium text-foreground/90 whitespace-nowrap">
    {hint ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="underline decoration-dotted cursor-help">
              {label}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-72 text-xs">
            {hint}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      label
    )}
  </td>
);

interface AccessTableBodyProps {
  accessGroups: AccessGroup[];
  availableResources: string[];
  colCount: number;
}

const AccessTableBody: FC<AccessTableBodyProps> = ({
  accessGroups,
  availableResources,
  colCount,
}) => {
  const availableSet = useMemo(
    () => new Set(availableResources),
    [availableResources],
  );

  // Keep a group when it has any available grantable resource OR a static row.
  const filteredGroups = useMemo(
    () =>
      RESOURCE_GROUPS.map((g) => ({
        ...g,
        resources: g.resources.filter((r) => availableSet.has(r)),
      })).filter((g) => g.resources.length > 0),
    [availableSet],
  );

  return (
    <tbody>
      {filteredGroups.map((group) => {
        const rowCount = group.resources.length;
        return (
          <Fragment key={group.label}>
            <tr className="border-t border-border/40 bg-muted/20">
              <td
                colSpan={colCount}
                className="px-5 py-2 text-2xs font-semibold tracking-widest uppercase text-muted-foreground/50"
              >
                {group.label}
              </td>
            </tr>
            {group.resources.map((resource, ri) => (
              <tr
                key={resource}
                className={cn(
                  "border-t border-border/30",
                  ri === rowCount - 1 && "border-b border-border/30",
                )}
              >
                <LabelCell
                  label={RESOURCE_LABELS[resource]}
                  hint={RESOURCE_HINTS[resource]}
                />
                {/* Superadmin (the couple) — always full, every feature. */}
                <td className="text-center">
                  <LevelBadge level="full" className="justify-center py-3.5" />
                </td>
                {accessGroups.map((accessGroup) => (
                  <td key={accessGroup.id} className="text-center">
                    <LevelBadge
                      level={getLevel(
                        accessGroup.permissions,
                        resource as Resource,
                      )}
                      className="justify-center py-3.5"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </Fragment>
        );
      })}
    </tbody>
  );
};

export default AccessTableBody;
