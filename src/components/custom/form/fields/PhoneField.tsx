import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  COUNTRIES,
  absorbDialCode,
  countryFromTimeZone,
  countryOption,
  formatPhone,
  nearbyCountries,
  splitPhone,
  toE164,
  type CountryCode,
  type CountryOption,
} from "@/lib/phone";

import FieldShell, { type FieldA11y } from "./FieldShell";

interface PhoneFieldProps {
  name: string;
  label?: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  placeholder?: string;
  /** Pre-selected country. Omit to infer from the browser timezone. */
  defaultCountry?: CountryCode;
}

interface PhoneControlProps {
  field: AnyFieldApi;
  hasError: boolean;
  controlProps: FieldA11y["controlProps"];
  placeholder?: string;
  defaultCountry?: CountryCode;
}

interface CountryGroup {
  value: string;
  heading: string;
  items: CountryOption[];
}

/** Matches on country name, ISO code, or dial code ("my", "MY", "+60", "60"). */
function matchCountry(country: CountryOption, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    country.name.toLowerCase().includes(q) ||
    country.code.toLowerCase().includes(q) ||
    country.dial.replace(/^\+/, "").startsWith(q.replace(/^\+/, ""))
  );
}

// One field: the dial code lives *in* the input ("+65 9123 4567") and the
// leading combobox is just the country (ISO) — picking one swaps the +code in
// place, keeping the digits already typed. Typing or pasting a code the other
// way ("+60 12-345 6789") is absorbed back into the combobox, so the two stay in
// sync from either direction.
//
// The visible text is the full number; the *stored* value is E.164 built from
// the national digits alone — so an untouched optional field saves empty rather
// than a bare "+65".
const PhoneControl = ({
  field,
  hasError,
  controlProps,
  placeholder,
  defaultCountry,
}: PhoneControlProps) => {
  const fallback = useMemo(
    () => defaultCountry ?? countryFromTimeZone(),
    [defaultCountry],
  );

  // Seeded once; the control owns text/country afterwards (the form value is
  // derived from them, not the reverse).
  const seed = useMemo(() => {
    const value = field.state.value as string | null | undefined;
    const { country } = splitPhone(value, fallback);
    return {
      country,
      text: value ? formatPhone(value) : `${countryOption(fallback).dial} `,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [country, setCountry] = useState<CountryCode>(seed.country);
  const [text, setText] = useState(seed.text);
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Radix Dialog traps focus to its own subtree, so the search input inside a
  // body-portaled popup can never be focused (typing falls through to the form
  // behind it). Render the popup *inside* the dialog when we're in one; outside
  // a dialog this stays null and the popup portals to body as usual.
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setContainer(
      rootRef.current?.closest<HTMLElement>('[data-slot="dialog-content"]') ??
        null,
    );
  }, []);

  const commit = (nextCountry: CountryCode, national: string) =>
    field.handleChange(toE164(nextCountry, national) ?? "");

  const handleText = (raw: string) => {
    // Keep "+" typeable — it only resolves once it forms a real dial code.
    const cleaned = raw.replace(/[^\d+\s()-]/g, "");
    setText(cleaned);

    const absorbed = absorbDialCode(cleaned);
    if (absorbed) {
      setCountry(absorbed.country);
      commit(absorbed.country, absorbed.national);
      return;
    }

    // No code in the text (they cleared it) — treat the digits as national
    // under whichever country the combobox is showing.
    commit(country, cleaned);
  };

  const pickCountry = (code: CountryCode) => {
    const national = absorbDialCode(text)?.national ?? text.replace(/\D/g, "");
    const e164 = toE164(code, national);

    setCountry(code);
    // Re-render the text off the new code, keeping the digits already typed —
    // formatted when the result is a real number, else just "<code> " to type on.
    setText(e164 ? formatPhone(e164) : `${countryOption(code).dial} `);
    commit(code, national);
  };

  const selected = countryOption(country);

  // "Nearby" is keyed off the user's HOME country (timezone), not the current
  // selection — so picking Brazil doesn't reshuffle the list under them. The
  // selection is pinned into the group when it isn't already there, so a
  // far-flung pick stays visible instead of being buried down the A–Z list.
  const groups = useMemo(() => {
    const nearby = nearbyCountries(fallback);
    if (!nearby.some((c) => c.code === country)) {
      nearby.unshift(countryOption(country));
    }
    const shortlisted = new Set(nearby.map((c) => c.code));

    return [
      { value: "nearby", heading: "Nearby", items: nearby },
      {
        value: "all",
        heading: "All countries",
        items: COUNTRIES.filter((c) => !shortlisted.has(c.code)),
      },
    ].filter((g) => g.items.length > 0);
  }, [fallback, country]);

  return (
    <InputGroup ref={rootRef} data-invalid={hasError}>
      <InputGroupAddon align="inline-start">
        <Combobox
          items={groups}
          value={selected}
          onValueChange={(next: CountryOption | null) =>
            next && pickCountry(next.code)
          }
          itemToStringLabel={(c: CountryOption) => c.name}
          isItemEqualToValue={(a: CountryOption, b: CountryOption) =>
            a.code === b.code
          }
          filter={matchCountry}
          autoHighlight
        >
          {/* Fixed width so swapping SG → MY can't reflow the input beside it. */}
          <ComboboxTrigger
            render={<InputGroupButton variant="ghost" size="xs" />}
            aria-label={`Country: ${selected.name} (${selected.dial})`}
            className="w-14 cursor-pointer justify-between font-medium text-foreground"
          >
            {selected.code}
          </ComboboxTrigger>

          <ComboboxContent
            className="w-72"
            container={container}
            initialFocus={searchRef}
          >
            <ComboboxInput
              ref={searchRef}
              placeholder="Search country or code…"
              showTrigger={false}
            />
            <ComboboxEmpty>No country matches.</ComboboxEmpty>

            <ComboboxList className="mt-1">
              {(group: CountryGroup) => (
                <ComboboxGroup key={group.value} items={group.items}>
                  <ComboboxLabel>{group.heading}</ComboboxLabel>
                  <ComboboxCollection>
                    {(c: CountryOption) => (
                      <ComboboxItem key={c.code} value={c}>
                        <span className="w-6 shrink-0 text-xs text-muted-foreground tabular-nums">
                          {c.code}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {c.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          {c.dial}
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </InputGroupAddon>

      <InputGroupInput
        {...controlProps}
        type="tel"
        inputMode="tel"
        value={text}
        onChange={(e) => handleText(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder ?? "+65 9123 4567"}
      />
    </InputGroup>
  );
};

const PhoneField = ({
  name,
  label,
  optional,
  hint,
  placeholder,
  defaultCountry,
}: PhoneFieldProps) => (
  <FieldShell name={name} label={label} optional={optional} hint={hint}>
    {(field, hasError, { controlProps }) => (
      <PhoneControl
        field={field}
        hasError={hasError}
        controlProps={controlProps}
        placeholder={placeholder}
        defaultCountry={defaultCountry}
      />
    )}
  </FieldShell>
);

export default PhoneField;
