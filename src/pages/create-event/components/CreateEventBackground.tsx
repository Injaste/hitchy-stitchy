export const CreateEventBackground = () => {
  const tiles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        .hs-logo {
          font-family: var(--font-display);
          font-size: 42px;
          font-weight: 700;
          background: linear-gradient(135deg, #d4af37 0%, #2d5a4a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -2px;
          transform: scaleY(1.1);
        }
      `}</style>
      <div className="animated-logo-grid">
        {tiles.map((i) => (
          <div
            key={i}
            className="logo-tile"
            style={{
              animationDelay: `${-i * 0.5}s`,
            }}
          >
            <div className="hs-logo">HS</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateEventBackground;
