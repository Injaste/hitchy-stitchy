import { useEffect, useState, type FC, type ReactNode } from "react";
import { CircleCheck, Snowflake, Sun, TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";

// Normalize both sides of a type-to-confirm match: lowercase, drop
// punctuation/symbols (keep letters, digits, spaces — Unicode-aware), collapse
// whitespace. So `Sarah's Wedding!` is satisfied by `sarahs wedding`.
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

type ConfirmVariant =
  | "default"
  | "destructive"
  | "warning"
  | "success"
  | "freeze"
  | "sun";

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
  sun: {
    headerClass: "text-sun",
    icon: <Sun className="size-5 shrink-0" />,
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
  /**
   * When set, renders a type-to-confirm input; the confirm button stays disabled
   * until the typed text matches (normalized). Reserved for high-stakes deletes.
   */
  confirmPhrase?: string;
  /** Force the confirm button disabled regardless of the phrase (e.g. the
   *  action is currently unavailable — show the dialog as informational). */
  confirmDisabled?: boolean;
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
  confirmPhrase,
  confirmDisabled,
  onConfirm,
  isPending,
  isSuccess,
  isError,
}) => {
  const { headerClass, icon: defaultIcon } = VARIANTS[variant];
  const resolvedIcon = icon === undefined ? defaultIcon : icon;

  const [typed, setTyped] = useState("");
  // Clear the input whenever the dialog opens/closes or the target changes.
  useEffect(() => setTyped(""), [open, confirmPhrase]);
  const phraseSatisfied =
    !confirmPhrase || normalize(typed) === normalize(confirmPhrase);

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
              <div className="space-y-1.5 leading-relaxed w-full">
                {children}
              </div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {confirmPhrase && (
          <AlertDialogBody>
            <div className="grid gap-1.5">
              <Label
                htmlFor="confirm-phrase-input"
                className="text-sm text-muted-foreground"
              >
                Type
                <span className="font-medium text-foreground">
                  {confirmPhrase}
                </span>
                to confirm.
              </Label>
              {/* Deliberately not auto-focused: focus stays on Cancel so the
                impact warning is read first and the mobile keyboard only
                appears when the user taps the field. */}
              <Input
                id="confirm-phrase-input"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </AlertDialogBody>
        )}

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
            disabled={confirmDisabled || !phraseSatisfied}
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
