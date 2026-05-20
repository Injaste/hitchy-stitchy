import { useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { FormShellContext } from "@/components/custom/form/form-context";
import { TextField } from "@/components/custom/form";
import { useThemeSheetStore } from "../store";

const ThemeNameField = () => {
  const setName = useThemeSheetStore((s) => s.setName);
  const setNameRef = useRef(setName);
  setNameRef.current = setName;

  const initialName = useThemeSheetStore.getState().initialName;

  const form = useForm({
    defaultValues: { name: initialName },
    validators: {
      onChange: ({ value }) => {
        if (!value.name?.trim()) {
          return { fields: { name: { message: "Theme name is required" } } };
        }
        return undefined;
      },
    },
    listeners: {
      onChange: ({ formApi }) => {
        const v = (formApi.state.values as { name: string }).name;
        setNameRef.current(v);
      },
    },
  });

  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <TextField name="name" label="Theme name" placeholder="Theme name" />
    </FormShellContext.Provider>
  );
};

export default ThemeNameField;
