import EditorPanel from "./EditorPanel";
import PreviewPanel from "./PreviewPanel";

const EditorLayout = () => (
  <div className="flex gap-8 h-[calc(100dvh-12rem)]">
    <EditorPanel />
    <PreviewPanel />
  </div>
);

export default EditorLayout;
