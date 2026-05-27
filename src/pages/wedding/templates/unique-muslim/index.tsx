import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { useFrame } from "react-frame-component";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import Hero from "./Hero";
import Details from "./Details";
import Itinerary from "./Itinerary";
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
import { motion } from "framer-motion";
import BackgroundImage from "./BackgroundImage";
import BackgroundFlowers from "./BackgroundFlowers";

const DEFAULT_DESCRIPTION =
  "We invite you to witness the beginning of our forever. A day where two souls become one, guided by faith and bounded by love.";

const STYLE_ATTR = "data-um-styles";
const FONT_ATTR = "data-um-font";

const UniqueMuslim = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;
  const bgImage = config?.background_image ?? "/dannad.png";
  const [ready, setReady] = useState(false);

  const couple = parseGoogleFontUrl(config?.font_couple_url);
  const heading = parseGoogleFontUrl(config?.font_heading_url);
  const body = parseGoogleFontUrl(config?.font_body_url);
  const number = parseGoogleFontUrl(config?.font_number_url);

  const fontUrls = useMemo(
    () =>
      [couple?.url, heading?.url, body?.url, number?.url].filter(
        (u): u is string => !!u,
      ),
    [couple?.url, heading?.url, body?.url, number?.url],
  );

  const { document: frameDoc } = useFrame();
  const { slug } = useParams<{ slug: string }>();
  const isPreview = !!frameDoc;

  const groom = config?.groom_name?.trim();
  const bride = config?.bride_name?.trim();
  const composedTitle =
    groom && bride ? `The Wedding of ${groom} & ${bride}` : "You're Invited";

  useDocumentMeta({
    title: config?.page_title?.trim() || composedTitle,
    description: config?.page_description?.trim() || DEFAULT_DESCRIPTION,
    image: config?.og_image?.trim() || config?.background_image?.trim() || null,
    url:
      !isPreview && slug
        ? `https://${import.meta.env.VITE_BASE_URL}/${slug}`
        : null,
  });

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
    ...(couple && {
      "--theme-font-couple": cssFontFamily(couple.family, couple.generic),
    }),
    ...(heading && {
      "--theme-font-heading": cssFontFamily(heading.family, heading.generic),
    }),
    ...(body && {
      "--theme-font-body": cssFontFamily(body.family, body.generic),
    }),
    ...(number && {
      "--theme-font-number": cssFontFamily(number.family, number.generic),
    }),
  } as CSSProperties;

  return (
    <motion.div
      className="um-root"
      style={rootStyle}
      initial={{ backgroundColor: "#ffffff" }}
      animate={{ backgroundColor: ready ? "#f4ead3" : "#ffffff" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <EnvelopePreloader
        loaderReady={!!loaderReady}
        onExitComplete={() => setReady(true)}
      />
      <BackgroundImage src={bgImage} ready={ready} />
      {/* <FloatingIcons /> */}
      <Hero eventConfig={eventConfig} pageConfig={pageConfig} ready={ready} />
      <Details eventConfig={eventConfig} pageConfig={pageConfig} />
      <Itinerary eventConfig={eventConfig} pageConfig={pageConfig} />
      <RSVP eventConfig={eventConfig} pageConfig={pageConfig} />

      <BackgroundFlowers ready={ready} />

      <AnchorBar
        ready={ready}
        items={uniqueMuslimAnchors.items.filter(
          (item) => !item.when || item.when(config ?? {}),
        )}
        classNames={uniqueMuslimAnchors.classNames}
        labels={uniqueMuslimAnchors.labels}
      />
    </motion.div>
  );
};

export default UniqueMuslim;
