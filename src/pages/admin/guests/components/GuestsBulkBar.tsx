import type { FC } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, X, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { itemRevealInUp } from "@/lib/animations";

import type { GuestStatus } from "../types";

interface GuestsBulkBarProps {
  count: number;
  onClear: () => void;
  onRequest: (status: GuestStatus) => void;
  isPending: boolean;
}

const GuestsBulkBar: FC<GuestsBulkBarProps> = ({
  count,
  onClear,
  onRequest,
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
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Confirm
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => onRequest("pending")}
            disabled={isPending}
          >
            <Clock className="w-4 h-4 mr-1.5" />
            Pending
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRequest("cancelled")}
            disabled={isPending}
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Cancel
          </Button>

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
