import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useFrame } from "react-frame-component";
import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import FloatingIcons from "./FloatingIcons";
import EnvelopePreloader from "./EnvelopePreloader";
import type { ThemeProps } from "@/pages/wedding/templates/types";
import { AnchorBar } from "@/pages/wedding/anchors";
import { uniqueMuslimAnchors } from "./anchors";
import slugCss from "./styles.css?inline";
import {
  parseGoogleFontUrl,
  cssFontFamily,
} from "@/pages/wedding/templates/utils/google-font-url";

const STYLE_ATTR = "data-um-styles";
const FONT_ATTR = "data-um-font";

const UniqueMuslim = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;
  const bgImage = config?.background_image ?? "/dannad.png";
  const [ready, setReady] = useState(false);

  const couple = parseGoogleFontUrl(config?.font_couple_url);
  const heading = parseGoogleFontUrl(config?.font_heading_url);
  const body = parseGoogleFontUrl(config?.font_body_url);

  const fontUrls = useMemo(
    () =>
      [couple?.url, heading?.url, body?.url].filter((u): u is string => !!u),
    [couple?.url, heading?.url, body?.url],
  );

  const { document: frameDoc } = useFrame();

  useEffect(() => {
    const doc = frameDoc ?? document;
    if (!doc?.head) return;

    const styleEl = doc.createElement("style");
    styleEl.setAttribute(STYLE_ATTR, "");
    styleEl.textContent = slugCss;
    doc.head.appendChild(styleEl);

    return () => {
      styleEl.remove();
    };
  }, [frameDoc]);

  useEffect(() => {
    const doc = frameDoc ?? document;
    if (!doc?.head) return;

    const added: HTMLLinkElement[] = [];
    for (const url of fontUrls) {
      if (doc.head.querySelector(`link[href="${url}"]`)) continue;
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.setAttribute(FONT_ATTR, "");
      doc.head.appendChild(link);
      added.push(link);
    }

    return () => {
      for (const link of added) link.remove();
    };
  }, [frameDoc, fontUrls]);

  const rootStyle = {
    ...(couple  && { "--theme-font-couple":  cssFontFamily(couple.family)  }),
    ...(heading && { "--theme-font-heading": cssFontFamily(heading.family) }),
    ...(body    && { "--theme-font-body":    cssFontFamily(body.family)    }),
  } as CSSProperties;

  return (
    <div className="um-root" style={rootStyle}>
      <EnvelopePreloader
        loaderReady={!!loaderReady}
        onExitComplete={() => setReady(true)}
      />
      <img
        className="fixed inset-0 w-full h-full aspect-square object-contain opacity-50 -z-10 blur-sm"
        src={bgImage}
        alt=""
      />
      <FloatingIcons />

      <Hero eventConfig={eventConfig} pageConfig={pageConfig} ready={ready} />
      <Details eventConfig={eventConfig} pageConfig={pageConfig} />
      <RSVP eventConfig={eventConfig} pageConfig={pageConfig} />

      <AnchorBar
        items={uniqueMuslimAnchors.items.filter(
          (item) => !item.when || item.when(config ?? {}),
        )}
        classNames={uniqueMuslimAnchors.classNames}
        labels={uniqueMuslimAnchors.labels}
      />
    </div>
  );
};

export default UniqueMuslim;
