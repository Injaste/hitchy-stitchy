import { Sparkle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface IconItem {
  id: number;
  left: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
  travelY: number;
}

const generateIcons = (count: number): IconItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 88 + 2,
    size: Math.random() * 14 + 10,
    rotation: Math.random() * 180 + 180,
    duration: Math.random() * 5 + 6,
    delay: Math.random() * 4,
    travelY: window.innerHeight * 0.1,
  }));

const getIconCount = (): number =>
  Math.min(Math.floor(window.innerWidth * 0.05), 30);

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
          @keyframes floatDown-${h.id} {
            0%   { transform: translateY(0)              rotate(${h.rotation}deg); opacity: 0.5; }
            70%  { opacity: 0.5; }
            100% { transform: translateY(${h.travelY}px) rotate(${h.rotation}deg); opacity: 0; }
          }
        `,
          )
          .join("")}
      `}</style>
      <div className="fixed left-0 right-0 top-0 h-60 pointer-events-none overflow-hidden z-40">
        {icons.map((icon) => (
          <div
            key={icon.id}
            style={{
              position: "absolute",
              top: "-30px",
              left: `${icon.left}%`,
              width: icon.size,
              height: icon.size,
              opacity: 1,
              animation: `floatDown-${icon.id} ${icon.duration}s ${icon.delay}s linear infinite`,
            }}
          >
            <Sparkle
              style={{ width: icon.size, height: icon.size }}
              className="stroke-pink-400 fill-pink-300"
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default FloatingIcons;
