import EditorPanel from "./EditorPanel";
import PreviewPanel from "./PreviewPanel";

const EditorLayout = () => (
  <div className="flex">
    <div className="flex-1 shrink-0 flex flex-col max-w-2xl">
      <EditorPanel />
    </div>
    <div className="mx-auto px-8">
      <PreviewPanel />
    </div>
  </div>
);

export default EditorLayout;
