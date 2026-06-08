import type { FC, ReactNode } from "react";
import { CircleCheck, Snowflake, TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SubmitButton from "@/components/custom/form/SubmitButton";

type ConfirmVariant =
  | "default"
  | "destructive"
  | "warning"
  | "success"
  | "freeze";

// Each variant drives the header text colour, the confirm button variant (same
// key name — see <SubmitButton variant={variant} />), and a default icon. The
// icon can be overridden per call (e.g. "restore" uses warning + a Sun icon).
const VARIANTS: Record<
  ConfirmVariant,
  { headerClass?: string; icon: ReactNode }
> = {
  default: { icon: null },
  destructive: {
    headerClass: "text-destructive",
    icon: <TriangleAlert className="size-5 shrink-0" />,
  },
  warning: {
    headerClass: "text-warning",
    icon: <TriangleAlert className="size-5 shrink-0" />,
  },
  success: {
    headerClass: "text-success",
    icon: <CircleCheck className="size-5 shrink-0" />,
  },
  freeze: {
    headerClass: "text-freeze",
    icon: <Snowflake className="size-5 shrink-0" />,
  },
};

interface ConfirmAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: ConfirmVariant;
  /** Overrides the variant's default icon. Pass null to hide it. */
  icon?: ReactNode;
  title: ReactNode;
  /** One-line message shown centered in the header (renders inside a <p>). */
  description?: ReactNode;
  /** Rich block content shown in the scrollable body below the header. */
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

const ConfirmAlertModal: FC<ConfirmAlertModalProps> = ({
  open,
  onOpenChange,
  variant = "default",
  icon,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  isPending,
  isSuccess,
  isError,
}) => {
  const { headerClass, icon: defaultIcon } = VARIANTS[variant];
  const resolvedIcon = icon === undefined ? defaultIcon : icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* Opt out of the missing-description warning when content lives in the
          body slot instead of an AlertDialogDescription. */}
      <AlertDialogContent
        {...(description || children ? {} : { "aria-describedby": undefined })}
      >
        <AlertDialogHeader className={headerClass}>
          <AlertDialogTitle
            className={resolvedIcon ? "flex items-center gap-2" : undefined}
          >
            {resolvedIcon}
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="leading-relaxed">
              {description}
            </AlertDialogDescription>
          )}
          {/* Block content (multiple <p>, values, etc.) renders as the
              description via asChild so it keeps the same in-header placement,
              spacing, centering and muted treatment as a plain description —
              text-foreground stays reserved for key items. */}
          {children && (
            <AlertDialogDescription asChild>
              <div className="space-y-1.5 leading-relaxed">{children}</div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="sm"
            disabled={isPending}
            autoFocus
          >
            {cancelLabel}
          </AlertDialogCancel>
          <SubmitButton
            type="button"
            variant={variant}
            size="sm"
            onClick={onConfirm}
            isPending={isPending}
            isSuccess={isSuccess}
            isError={isError}
          >
            {confirmLabel}
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmAlertModal;
