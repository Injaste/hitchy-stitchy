import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

interface NotesMarkdownProps {
  content: string | null | undefined;
  size?: "default" | "sm";
}

const forceBreaks = (text: string) => text.replace(/\n/g, "  \n");

const markdownComponents = {
  p: ({ children }: any) => <p className="m-0">{children}</p>,
  hr: () => <hr className="my-2 border-foreground/15" />,
  ul: ({ children }: any) => (
    <ul className="list-disc pl-4 my-0">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-4 my-0">{children}</ol>
  ),
  li: ({ children }: any) => <li className="my-0">{children}</li>,
  strong: ({ children }: any) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: any) => <em className="italic">{children}</em>,
};

const NotesMarkdown = ({ content, size = "default" }: NotesMarkdownProps) => {
  if (!content) {
    return (
      <p className="text-xs text-muted-foreground/50 italic">No notes added</p>
    );
  }

  return (
    <div
      className={cn(
        "text-xs bg-primary/5 rounded-md border border-primary/10",
        size === "default" && "px-3 py-1.5",
        size === "sm" && "px-1.5 py-0.5",
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={markdownComponents}
      >
        {forceBreaks(content)}
      </ReactMarkdown>
    </div>
  );
};

export default NotesMarkdown;
