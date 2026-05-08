import EditorPanel from "./EditorPanel";
import PreviewPanel from "./PreviewPanel";

const EditorLayout = () => (
  <div className="flex gap-8">
    <EditorPanel />
    <PreviewPanel />
  </div>
);

export default EditorLayout;
