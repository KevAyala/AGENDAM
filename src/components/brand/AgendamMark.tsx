// Isotipo "@" en grid de puntos (dot-matrix). 100% SVG generado por código —
// no requiere ningún asset exportado. Spec completo en
// docs/AGENDAM_Documento_05_Identidad_de_Marca_v1_0.md §4.

const INNER_A = new Set([
  "3,2", "4,2", "5,2",
  "3,3",        "5,3",
  "3,4", "4,4", "5,4",
]);

const AT_DOTS: readonly [number, number][] = [
  [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
  [0, 1], [1, 1],                                 [6, 1], [7, 1],
  [0, 2], [1, 2],         [3, 2], [4, 2], [5, 2],         [7, 2],
  [0, 3], [1, 3],         [3, 3],         [5, 3],         [7, 3],
  [0, 4], [1, 4],         [3, 4], [4, 4], [5, 4],
  [0, 5], [1, 5],
                  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
                                                  [5, 7], [6, 7], [7, 7],
];

export function AgendamMark({
  size = 60,
  outerColor = "#2F6F94",
  innerColor = "#D4537E",
  monoColor,
}: {
  size?: number;
  outerColor?: string;
  innerColor?: string;
  /** Si se pasa, anula los dos colores — uso en imprenta / ícono. */
  monoColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 90 90"
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden
    >
      {AT_DOTS.map(([col, row], i) => {
        const isInner = INNER_A.has(`${col},${row}`);
        const fill = monoColor ?? (isInner ? innerColor : outerColor);
        return <circle key={i} cx={col * 10 + 10} cy={row * 10 + 10} r={4} fill={fill} />;
      })}
    </svg>
  );
}
