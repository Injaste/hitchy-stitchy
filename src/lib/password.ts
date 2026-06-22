// Mirrors the Supabase Auth password policy so the client can give live feedback
// (the PasswordChecklist) instead of relying on the server's terse error. MUST
// stay in sync with Auth → Password Requirements (lowercase, uppercase, digits,
// symbols) and "Minimum password length". Update here if you change it.
export const MIN_PASSWORD_LENGTH = 8;

export interface PasswordRule {
  id: string;
  label: string;
  /** A couple of example characters shown as a hint next to the rule. */
  example?: string;
  test: (value: string) => boolean;
}

// The symbol set is Supabase's documented one: !@#$%^&*()_+-=[]{};':"|<>?,./`~
export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    test: (v) => v.length >= MIN_PASSWORD_LENGTH,
  },
  { id: "lowercase", label: "A lowercase letter", example: "abc", test: (v) => /[a-z]/.test(v) },
  { id: "uppercase", label: "An uppercase letter", example: "ABC", test: (v) => /[A-Z]/.test(v) },
  { id: "number", label: "A number", example: "123", test: (v) => /\d/.test(v) },
  {
    id: "symbol",
    label: "A symbol",
    example: "!@#",
    test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|<>?,.\/`~]/.test(v),
  },
];

export const isPasswordValid = (value: string) =>
  PASSWORD_RULES.every((rule) => rule.test(value));
