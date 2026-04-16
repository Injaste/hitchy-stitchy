import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface NotesMarkdownProps {
  content: string | null | undefined;
  minified?: boolean;
}

const markdownClass =
  "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_em]:italic";

const NotesMarkdown = ({ content, minified = false }: NotesMarkdownProps) => {
  if (!content) {
    if (minified) return null;
    return (
      <p className="text-sm text-muted-foreground/50 italic">No notes added</p>
    );
  }

  if (minified) {
    return (
      <div
        className={cn(
          "text-xs bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/10 h-full",
          markdownClass,
        )}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-sm bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10",
        markdownClass,
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default NotesMarkdown;
