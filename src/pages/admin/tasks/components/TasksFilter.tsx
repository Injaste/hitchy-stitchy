import { type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { widthReveal } from "@/lib/animations";
import { useIsMobile } from "@/hooks/use-media-query";

import { useMembersQuery } from "../../members/queries";
import { useTasksFilterStore } from "../hooks/useTasksFilter";

interface AssigneeSelectProps {
  memberId: string | null;
  setMemberId: (id: string | null) => void;
  members: { id: string; display_name: string }[] | undefined;
  triggerClassName?: string;
}

const AssigneeSelect: FC<AssigneeSelectProps> = ({
  memberId,
  setMemberId,
  members,
  triggerClassName,
}) => (
  <Select
    value={memberId ?? "all"}
    onValueChange={(v) => setMemberId(v === "all" ? null : v)}
  >
    <SelectTrigger className={triggerClassName}>
      <SelectValue placeholder="Assignee" />
    </SelectTrigger>
    <SelectContent position="popper" align="end">
      <SelectItem value="all">All assignees</SelectItem>
      {members?.map((m) => (
        <SelectItem key={m.id} value={m.id}>
          {m.display_name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const TasksFilter: FC = () => {
  const isMobile = useIsMobile();
  const memberId = useTasksFilterStore((s) => s.memberId);
  const setMemberId = useTasksFilterStore((s) => s.setMemberId);
  const reset = useTasksFilterStore((s) => s.reset);
  const activeCount = memberId ? 1 : 0;
  const { data: members } = useMembersQuery();

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative h-9 w-9 shrink-0"
            aria-label="Filter tasks"
          >
            <SlidersHorizontal className="size-4" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-2xs font-medium text-primary-foreground flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-3 space-y-3">
          <div className="flex flex-col gap-2 [&>button]:w-full">
            <AssigneeSelect
              memberId={memberId}
              setMemberId={setMemberId}
              members={members}
              triggerClassName="w-full"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={activeCount === 0}
            className="w-full text-muted-foreground"
          >
            <X className="size-3.5 mr-1" /> Reset
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <AssigneeSelect
        memberId={memberId}
        setMemberId={setMemberId}
        members={members}
        triggerClassName="h-9 w-[150px]"
      />
      <AnimatePresence initial={false}>
        {activeCount > 0 && (
          <motion.div
            key="reset"
            variants={widthReveal}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="overflow-hidden"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={reset}
              aria-label="Reset filters"
              className="h-9 w-9 text-muted-foreground"
            >
              <X className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksFilter;
