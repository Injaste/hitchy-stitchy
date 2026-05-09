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

import type { RSVPDeleteProps } from "./types";

const RSVPDelete = ({
  open,
  onConfirm,
  onCancel,
  classNames,
  labels,
}: RSVPDeleteProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className={classNames.content}>
        <AlertDialogHeader>
          <AlertDialogTitle className={classNames.title}>
            {labels.title}
          </AlertDialogTitle>
          <AlertDialogDescription className={classNames.description}>
            {labels.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={classNames.footer}>
          <AlertDialogCancel
            asChild
            onClick={onCancel}
            className={classNames.cancel}
          >
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {labels.cancel}
            </motion.button>
          </AlertDialogCancel>

          <AlertDialogAction
            asChild
            onClick={onConfirm}
            className={classNames.confirm}
          >
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {labels.confirm}
            </motion.button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RSVPDelete;
