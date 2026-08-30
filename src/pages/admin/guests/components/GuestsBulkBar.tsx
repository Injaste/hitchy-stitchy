import type { FC } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Trash2, X, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { itemRevealInUp } from "@/lib/animations";

import type { GuestStatus } from "../types";

interface GuestsBulkBarProps {
  count: number;
  onClear: () => void;
  onRequest: (status: GuestStatus) => void;
  onRequestDelete: () => void;
  canDelete: boolean;
  isPending: boolean;
}

const GuestsBulkBar: FC<GuestsBulkBarProps> = ({
  count,
  onClear,
  onRequest,
  onRequestDelete,
  canDelete,
  isPending,
}) => {
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
          <Button
            variant="ghost-success"
            size="sm"
            onClick={() => onRequest("confirmed")}
            disabled={isPending}
            aria-label="Confirm"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Confirm</span>
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => onRequest("pending")}
            disabled={isPending}
            aria-label="Pending"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Pending</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRequest("cancelled")}
            disabled={isPending}
            aria-label="Cancel"
          >
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
          {canDelete && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="destructive"
                size="sm"
                onClick={onRequestDelete}
                disabled={isPending}
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </>
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
