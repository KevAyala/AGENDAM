import { AgendamMark } from "./AgendamMark";

/** Logotipo completo: isotipo + wordmark Nunito. Uso: fondos claros, membretes. */
export function Logotype({
  markSize = 60,
  textColor = "#2F6F94",
  monoMark,
}: {
  markSize?: number;
  textColor?: string;
  monoMark?: string;
}) {
  const fontSize = Math.round(markSize * 0.58);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(markSize * 0.22) }}>
      <AgendamMark size={markSize} monoColor={monoMark} />
      <span
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 700,
          fontSize,
          letterSpacing: "0.16em",
          color: textColor,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        AGENDAM
      </span>
    </div>
  );
}

/** Logotipo compacto para nav y contextos pequeños. */
export function SmallLogotype({
  markSize = 26,
  monoMarkColor,
  textColor = "#FAF9F7",
  fontSize = 12,
}: {
  markSize?: number;
  monoMarkColor?: string;
  textColor?: string;
  fontSize?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(markSize * 0.3) }}>
      <AgendamMark size={markSize} monoColor={monoMarkColor} />
      <span
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 700,
          fontSize,
          letterSpacing: "0.18em",
          color: textColor,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        AGENDAM
      </span>
    </div>
  );
}
