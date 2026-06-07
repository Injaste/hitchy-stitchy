# Forms

## Two tiers — use the highest that fits

**Tier 1 — bundles** (`FormCard` / `FormDialog` + `FormHeader` / `FormBody` /
`FormFooter`): opinionated chrome for the common shape — one self-contained form,
single submit lifecycle, standard fields + footer. `FormCard` = inline card;
`FormDialog` = modal; both share `useFormCore`. `FormHeader` takes `icon`;
`FormFooter` takes `fullWidth` + `submitDisabled`.

**Tier 2 — shells** (`FormShell`, `FieldShell`, `SubmitButton`): the
un-opinionated pieces the bundles are built on. Drop to them when a bundle's
assumptions break.

**Litmus:** single-step / self-contained / standard fields → bundle. Multi-step /
parent-owned mutation / bespoke inputs / custom buttons → shells (e.g. the
create-event wizard).

## Form errors: inline vs toast

| | `<FormError>` (inline) | toast |
|---|---|---|
| lifetime | persists | transient |
| wiring | `silent: true` + render it | automatic (wrapper) |

**Rule:** toast by default. Inline `<FormError>` only when the surface *persists*
**and** the error is fixable *in the form* (bad credentials, wrong password). The
container is a hint, not the rule — `ProfileForm` is a `FormCard` that correctly
toasts ("failed to save" isn't fixed in place).

**Coupling (move together):** render `<FormError>` ⟺ mutation is `silent`. Banner
without silent = double feedback; silent without banner = silent failure.

`<FormError error={mutationError} />` reads the attempt count from form context.
Field-level errors (`FieldShell`) are separate and always per-field. Wrapper modes
in [mutations.md](mutations.md).
