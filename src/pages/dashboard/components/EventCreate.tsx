import { Plus } from "lucide-react";

interface EventCreateProps {
  onCreateEvent: () => void;
}

const EventCreate = ({ onCreateEvent }: EventCreateProps) => (
  <div className="hidden sm:block h-full">
    <div
      onClick={onCreateEvent}
      className="h-full min-h-48 rounded-xl border-2 border-dashed border-foreground/20 hover:border-primary bg-transparent transition-colors flex flex-col items-center justify-center gap-4 p-6 cursor-pointer group"
    >
      <div className="w-10 h-10 rounded-full border border-dashed border-muted-foreground/30 group-hover:border-primary flex items-center justify-center transition-colors">
        <Plus className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
          Plan another event
        </p>
      </div>
    </div>
  </div>
);

export default EventCreate;
