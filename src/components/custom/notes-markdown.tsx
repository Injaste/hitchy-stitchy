import ReactMarkdown from "react-markdown"

interface NotesMarkdownProps {
  content: string | null | undefined
  minified?: boolean
}

const markdownClass =
  "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_em]:italic"

const NotesMarkdown = ({ content, minified = false }: NotesMarkdownProps) => {
  if (!content) {
    if (minified) return null
    return (
      <p className="text-sm text-muted-foreground/50 italic">No notes added</p>
    )
  }

  if (minified) {
    return (
      <div
        className={`text-xs bg-primary/5 p-1.5 rounded-md text-primary border border-primary/10 leading-snug line-clamp-1 ${markdownClass}`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    )
  }

  return (
    <div
      className={`text-sm bg-primary/5 p-3 rounded-md text-primary border border-primary/10 leading-relaxed ${markdownClass}`}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

export default NotesMarkdown
