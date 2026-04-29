import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface NotesMarkdownProps {
  content: string | null | undefined;
  size?: "default" | "sm";
}

const markdownClass =
  "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_em]:italic break-all text-xs bg-primary/5 rounded-md border border-primary/10";

const NotesMarkdown = ({ content, size = "default" }: NotesMarkdownProps) => {
  if (!content) {
    return (
      <p className="text-xs text-muted-foreground/50 italic">No notes added</p>
    );
  }

  return (
    <div
      className={cn(
        markdownClass,
        size === "default" && "px-3 py-1.5",
        size === "sm" && "px-1.5 py-0.5",
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default NotesMarkdown;
