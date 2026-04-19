import EditorTabs from "./EditorTabs"
import PreviewPanel from "./PreviewPanel"

const EditorLayout = () => (
  <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div className="min-w-0">
      <EditorTabs />
    </div>
    <div className="lg:sticky lg:top-24 lg:self-start">
      <PreviewPanel />
    </div>
  </div>
)

export default EditorLayout
