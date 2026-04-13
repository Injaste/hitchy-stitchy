import type { FC } from "react";
import { motion } from "framer-motion";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RSVPDeleteProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RSVPDelete: FC<RSVPDeleteProps> = ({ open, onConfirm, onCancel }) => {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-md max-w-sm font-medium">
        <AlertDialogHeader>
          <AlertDialogTitle className="italic text-primary text-xl">
            Remove your RSVP?
          </AlertDialogTitle>
          <AlertDialogDescription className="italic text-muted-foreground">
            We'd hate to see you go. Are you sure you want to remove your RSVP?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            asChild
            onClick={onCancel}
            className="rounded-xl border-primary/30 font-bold"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Keep it
            </motion.button>
          </AlertDialogCancel>

          <AlertDialogAction
            asChild
            onClick={onConfirm}
            className="rounded-xl  bg-destructive hover:bg-destructive/90 font-bold"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Yes, remove
            </motion.button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RSVPDelete;
