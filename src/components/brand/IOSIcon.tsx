import { AgendamMark } from "./AgendamMark";

/** Ícono de app (iOS / squircle) — degradado azul→rosa evitando morado. */
export function IOSIcon({ size = 200 }: { size?: number }) {
  const br = Math.round(size * 0.225);
  const markSize = Math.round(size * 0.52);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: br,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        boxShadow: `0 ${size * 0.1}px ${size * 0.3}px rgba(47,111,148,0.3), 0 ${size * 0.03}px ${size * 0.1}px rgba(0,0,0,0.5)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(145deg, #C0DAE8 0%, #6AAACB 40%, #5A9CBF 65%, #A07898 83%, #C27490 100%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AgendamMark size={markSize} monoColor="rgba(255,255,255,0.92)" />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 42%, transparent 58%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 -8px 20px rgba(0,0,0,0.14)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
