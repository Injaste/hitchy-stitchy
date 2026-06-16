import Frame from "react-frame-component";
import cssText from "/src/index.css?inline";
import Wedding from "@/pages/wedding";
import type { PublicEventConfig } from "@/pages/wedding/types";

interface InvitationPreviewFrameProps {
  config: PublicEventConfig;
}

// Isolated iframe render of a wedding page from a composed PublicEventConfig.
// Shared by the template sheet (preview a template) and the edit sheet (live
// preview of the draft). The iframe scopes the wedding template's CSS away from
// the admin app.
const InvitationPreviewFrame = ({ config }: InvitationPreviewFrameProps) => {
  return (
    <Frame
      style={{ width: "100%", height: "100%", border: "none" }}
      head={
        <>
          <style dangerouslySetInnerHTML={{ __html: cssText }} />
          <style>
            {`html, body { scrollbar-width: none; -ms-overflow-style: none; }
              ::-webkit-scrollbar { display: none; }`}
          </style>
        </>
      }
    >
      <Wedding previewConfig={config} />
    </Frame>
  );
};

export default InvitationPreviewFrame;
