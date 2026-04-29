import { Star, Moon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface IconItem {
  id: number;
  left: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
  travelY: number;
  variant: "star" | "moon";
}

const generateIcons = (count: number): IconItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 88 + 2,
    size: Math.random() * 12 + 12,
    rotation: Math.random() * 180,
    duration: Math.random() * 6 + 8,
    delay: Math.random() * 5,
    travelY: window.innerHeight * 0.12,
    variant: i % 3 === 0 ? "moon" : "star",
  }));

const getIconCount = (): number =>
  Math.min(Math.floor(window.innerWidth * 0.04), 24);

const FloatingIcons = () => {
  const [iconCount, setIconCount] = useState(() => getIconCount());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIconCount(getIconCount()), 200);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, []);

  const icons = useMemo(() => generateIcons(iconCount), [iconCount]);

  return (
    <>
      <style>{`
        ${icons
          .map(
            (h) => `
          @keyframes drift-${h.id} {
            0%   { transform: translateY(0)              rotate(${h.rotation}deg); opacity: 0.4; }
            70%  { opacity: 0.4; }
            100% { transform: translateY(${h.travelY}px) rotate(${h.rotation + 30}deg); opacity: 0; }
          }
        `,
          )
          .join("")}
      `}</style>
      <div className="fixed left-0 right-0 top-0 h-72 pointer-events-none overflow-hidden z-40">
        {icons.map((icon) => {
          const Icon = icon.variant === "moon" ? Moon : Star;
          return (
            <div
              key={icon.id}
              style={{
                position: "absolute",
                top: "-30px",
                left: `${icon.left}%`,
                width: icon.size,
                height: icon.size,
                opacity: 1,
                animation: `drift-${icon.id} ${icon.duration}s ${icon.delay}s linear infinite`,
              }}
            >
              <Icon
                style={{ width: icon.size, height: icon.size }}
                className="stroke-primary fill-primary/10"
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FloatingIcons;
