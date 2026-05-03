import type { RSVPSectionConfig, RSVPFormData } from "@/pages/templates/types";

export type RSVPFieldKey = "name" | "phone" | "guestCount" | "message";

export interface RSVPFieldClassNames {
  inputGroup?: string;
  input?: string;
  textarea?: string;
  inputAddon?: string;
  inputIcon?: string;
}

export interface RSVPFormClassNames {
  form?: string;
  fieldGroup?: string;
  fieldWrapper?: string;
  field?: string;
  fieldLabel?: string;
  fieldRequiredMark?: string;
  fieldOptionalMark?: string;
  inputGroup?: string;
  inputGroupTextarea?: string;
  input?: string;
  textarea?: string;
  inputAddon?: string;
  inputAddonTextarea?: string;
  inputIcon?: string;
  fieldError?: string;
  actions?: string;
  submit?: string;
  cancel?: string;
  fields?: Partial<Record<RSVPFieldKey, RSVPFieldClassNames>>;
}

export interface RSVPFormLabels {
  name: { label: string; placeholder: string };
  phone: { label: string; placeholder: string; optional: string };
  guestCount: {
    label: string;
    placeholder: (max: number) => string;
    optional: string;
  };
  message: { label: string; placeholder: string; optional: string };
  required: string;
  submit: { idle: string; editing: string; submitting: string };
  cancel: string;
}

export interface TextFieldState {
  name: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  isInvalid: boolean;
  errors: Array<{ message?: string } | undefined>;
}

export interface NumberFieldState {
  name: string;
  value: number;
  onChange: (v: number) => void;
  onBlur: () => void;
  isInvalid: boolean;
  errors: Array<{ message?: string } | undefined>;
  min: number;
  max: number;
}

export interface TextFieldProps {
  field: TextFieldState;
  required: boolean;
  optionalLabel?: string;
  classNames: RSVPFormClassNames;
  labels: RSVPFormLabels;
  delay: number;
}

export interface NumberFieldProps {
  field: NumberFieldState;
  required: boolean;
  optionalLabel?: string;
  classNames: RSVPFormClassNames;
  labels: RSVPFormLabels;
  delay: number;
}

export interface RSVPFormProps {
  defaultValues?: Partial<RSVPFormData>;
  onSubmit: (value: RSVPFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing: boolean;
  rsvpConfig: RSVPSectionConfig;
  limits: { min: number; max: number };
  classNames: RSVPFormClassNames;
  labels: RSVPFormLabels;
}

export interface RSVPDeleteClassNames {
  content?: string;
  title?: string;
  description?: string;
  footer?: string;
  cancel?: string;
  confirm?: string;
}

export interface RSVPDeleteLabels {
  title: string;
  description: string;
  cancel: string;
  confirm: string;
}

export interface RSVPDeleteProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  classNames: RSVPDeleteClassNames;
  labels: RSVPDeleteLabels;
}
