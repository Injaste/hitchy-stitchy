import { Fragment, useMemo, type FC } from "react";
import { cn } from "@/lib/utils";
import type { AccessGroup, Resource } from "../types";
import { RESOURCE_GROUPS, RESOURCE_LABELS, getLevel } from "../types";
import LevelBadge from "./LevelBadge";

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
  const availableSet = useMemo(() => new Set(availableResources), [availableResources]);

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
      {filteredGroups.map((group) => (
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
                ri === group.resources.length - 1 && "border-b border-border/30",
              )}
            >
              <td className="px-5 py-3.5 font-medium text-foreground/90 whitespace-nowrap">
                {RESOURCE_LABELS[resource]}
              </td>
              {accessGroups.map((accessGroup) => (
                <td key={accessGroup.id} className="text-center">
                  <LevelBadge
                    level={getLevel(accessGroup.permissions, resource as Resource)}
                    className="justify-center py-3.5"
                  />
                </td>
              ))}
            </tr>
          ))}
        </Fragment>
      ))}
    </tbody>
  );
};

export default AccessTableBody;
