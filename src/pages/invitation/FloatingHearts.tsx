import { Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface HeartItem {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  travelY: number;
}

const generateHearts = (count: number): HeartItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 88 + 2,
    size: Math.random() * 14 + 10,
    duration: Math.random() * 5 + 6,
    delay: Math.random() * 4,
    travelY: window.innerHeight * 0.1,
  }));

const getHeartCount = (): number =>
  Math.min(Math.floor(window.innerWidth * 0.05), 30);

const FloatingHearts = () => {
  const [heartCount, setHeartCount] = useState(() => getHeartCount());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setHeartCount(getHeartCount()), 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, []);

  const hearts = useMemo(() => generateHearts(heartCount), [heartCount]);

  return (
    <>
      <style>{`
        ${hearts
          .map(
            (h) => `
          @keyframes floatDown-${h.id} {
            0%   { transform: translateY(0);           opacity: 0.5; }
            70%  { opacity: 0.5; }
            100% { transform: translateY(${h.travelY}px); opacity: 0; }
          }
        `,
          )
          .join("")}
      `}</style>
      <div className="fixed left-0 right-0 top-0 h-60 pointer-events-none overflow-hidden z-40">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            style={{
              position: "absolute",
              top: "-30px",
              left: `${heart.left}%`,
              width: heart.size,
              height: heart.size,
              opacity: 1,
              animation: `floatDown-${heart.id} ${heart.duration}s ${heart.delay}s linear infinite`,
            }}
          >
            <Heart
              style={{ width: heart.size, height: heart.size }}
              className="stroke-pink-400 fill-pink-300"
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default FloatingHearts;
