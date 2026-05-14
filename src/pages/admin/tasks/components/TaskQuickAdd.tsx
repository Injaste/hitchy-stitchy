import { useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormShell, TextField } from "@/components/custom/form";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useTaskMutations } from "../queries";
import { useTaskLabelFilterStore } from "../hooks/useTaskLabelFilter";
import { ALL_LABEL, type TaskStatus } from "../types";
import { TASK_ITEM_DURATION, itemFadeIn } from "@/lib/animations";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
});

interface TaskQuickAddProps {
  status: TaskStatus;
}

const TaskQuickAdd = ({ status }: TaskQuickAddProps) => {
  const [isAdding, setIsAdding] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const { eventId } = useAdminStore();
  const { create } = useTaskMutations();
  const activeLabel = useTaskLabelFilterStore((s) => s.activeLabel);
  const prefillLabel = activeLabel !== ALL_LABEL ? activeLabel : null;

  const form = useForm({
    defaultValues: { title: "" },
    validators: { onChange: schema },
    onSubmit: ({ value }) => {
      const parsed = schema.safeParse(value);
      if (!parsed.success) return;
      create.mutate(
        {
          event_id: eventId!,
          title: parsed.data.title.trim(),
          details: null,
          label: prefillLabel,
          status,
          priority: null,
          due_at: null,
          assignees: [],
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            }, TASK_ITEM_DURATION * 1000);
          },
        },
      );
      form.reset();
    },
  });

  const cancel = () => {
    form.reset();
    setIsAdding(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (
      !e.currentTarget.contains(e.relatedTarget) &&
      !form.getFieldValue("title").trim()
    ) {
      cancel();
    }
  };

  return (
    <AnimatePresence mode="popLayout">
      {!isAdding ? (
        <motion.div key="button" className="hidden lg:block" variants={itemFadeIn} initial="hidden" animate="show" exit="hidden">
          <Button
            className="w-full min-h-[108px] flex items-center justify-center px-4 rounded-xl border border-dashed border-border"
            variant="ghost"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="size-4.5" /> Add task
          </Button>
        </motion.div>
      ) : (
        <motion.div key="form" className="hidden lg:block scroll-mb-8" variants={itemFadeIn} initial="hidden" animate="show" exit="hidden">
          <FormShell ref={formRef} form={form} onBlur={handleBlur}>
            <Card>
              <CardContent className="space-y-2">
                <FieldGroup>
                  <TextField
                    name="title"
                    label=""
                    placeholder="Task title…"
                    autoFocus
                  />
                </FieldGroup>
                <div className="flex justify-end items-center gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={cancel}>
                    <X className="size-4" />
                  </Button>
                  <Button type="submit" size="sm" disabled={create.isPending}>
                    {create.isPending ? "Adding…" : "Add"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FormShell>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskQuickAdd;
