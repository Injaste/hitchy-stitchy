import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useFrame } from "react-frame-component";
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
      <motion.img
        className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md h-dvh object-contain object-center opacity-50"
        src={bgImage}
        alt=""
        animate={{ filter: ready ? "blur(8px)" : "blur(0px)" }}
        transition={{ duration: 1, delay: 1 }}
      />
      {/* <FloatingIcons /> */}
      <Hero eventConfig={eventConfig} pageConfig={pageConfig} ready={ready} />
      <Details eventConfig={eventConfig} pageConfig={pageConfig} />
      <Itinerary eventConfig={eventConfig} pageConfig={pageConfig} />
      <RSVP eventConfig={eventConfig} pageConfig={pageConfig} />

      <motion.img
        src="/images/background/bg-flower-1.png"
        alt=""
        className="fixed left-0 right-0 top-0 rotate-180 w-[101%] scale-101 max-w-md mx-auto"
        initial={{ y: "100%", opacity: 0 }}
        animate={
          ready
            ? {
                opacity: 1,
                y: 0,
                rotate: [0, 0.6, -0.4, 0.3, 0],
                skewX: [0, 0.5, -0.3, 0.2, 0],
              }
            : {}
        }
        transition={{
          y: { duration: 1.2, ease: "easeOut" },
          opacity: { duration: 1.2, ease: "easeOut" },
          rotate: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.3, 0.6, 0.8, 1],
          },
          skewX: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.3, 0.6, 0.8, 1],
          },
        }}
      />
      <motion.img
        src="/images/background/bg-flower-1.png"
        alt=""
        className="fixed left-0 right-0 bottom-0 w-[101%] max-w-md mx-auto scale-101"
        initial={{ y: "100%", opacity: 0 }}
        animate={
          ready
            ? {
                y: 0,
                opacity: 1,
                rotate: [0, 0.6, -0.4, 0.3, 0],
                skewX: [0, 0.5, -0.3, 0.2, 0],
              }
            : {}
        }
        transition={{
          y: { duration: 1.2, ease: "easeOut" },
          opacity: { duration: 1.2, ease: "easeOut" },
          rotate: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.3, 0.6, 0.8, 1],
          },
          skewX: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.3, 0.6, 0.8, 1],
          },
        }}
      />

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
