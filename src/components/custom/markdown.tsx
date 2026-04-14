import type { FC } from "react";
import ReactMarkdown from "react-markdown";

const Markdown: FC<{ content: string }> = ({ content }) => {
  return (
    <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_em]:italic">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default Markdown;
