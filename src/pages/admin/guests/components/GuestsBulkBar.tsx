import type { FC } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ChevronDown,
  Clock,
  Copy,
  ListChecks,
  MoreHorizontal,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { itemRevealInUp } from "@/lib/animations";

import type { GuestStatus } from "../types";

interface GuestsBulkBarProps {
  count: number;
  onClear: () => void;
  onRequest: (status: GuestStatus) => void;
  onRequestDelete: () => void;
  /** Opens the page-assignment sheet (adds rows, so it needs create rights). */
  onRequestPages: () => void;
  canAssignPages: boolean;
  canDelete: boolean;
  isPending: boolean;
}

const GuestsBulkBar: FC<GuestsBulkBarProps> = ({
  count,
  onClear,
  onRequest,
  onRequestDelete,
  onRequestPages,
  canAssignPages,
  canDelete,
  isPending,
}) => {
  const hasActions = canAssignPages || canDelete;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={itemRevealInUp}
      className="overflow-hidden mb-3"
    >
      <div className="rounded-lg bg-muted/40 border border-border px-5 py-3 flex flex-wrap items-center gap-3">
        <p className="text-sm text-foreground">
          <span className="font-medium">{count}</span>
          <span className="text-muted-foreground"> guests selected</span>
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                aria-label="Change status"
              >
                <ListChecks className="w-4 h-4" />
                <span className="hidden sm:inline">Status</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="success"
                onSelect={() => onRequest("confirmed")}
                disabled={isPending}
              >
                <CheckCircle className="w-4 h-4" />
                Confirm
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="warning"
                onSelect={() => onRequest("pending")}
                disabled={isPending}
              >
                <Clock className="w-4 h-4" />
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onRequest("cancelled")}
                disabled={isPending}
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  aria-label="More actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Actions</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canAssignPages && (
                  <DropdownMenuItem onSelect={onRequestPages} disabled={isPending}>
                    <Copy className="w-4 h-4" />
                    Pages
                  </DropdownMenuItem>
                )}
                {canAssignPages && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={onRequestDelete}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            disabled={isPending}
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GuestsBulkBar;
