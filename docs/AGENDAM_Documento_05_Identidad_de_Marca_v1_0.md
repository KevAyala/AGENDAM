# AGENDAM
## Documento 05 — Identidad de Marca (Brand Identity)
Versión 1.0 | Estado: Borrador | Agosto 2026

---

## 0. Origen y nota sobre el archivo `.make`

- **Fuente**: [Figma Make — Brand Identity for AGENDAM](https://www.figma.com/make/Pc8sEYXkEQ55SdS5jDGqwf/Brand-Identity-for-AGENDAM)
- El archivo `Brand Identity for AGENDAM.make` que se agregó a esta carpeta **no sirve como fuente de código**: es un paquete binario propietario de Figma Make (zip que contiene `canvas.fig` en formato binario interno de Figma, historial del chat de IA, thumbnails e imágenes de referencia). No contiene componentes React/CSS extraíbles directamente ni es legible por un editor de texto o por Claude sin la app de Figma.
- Todo el código fuente real (React + Tailwind) **sí se extrajo** directamente del proyecto vía Figma MCP (`get_design_context`), y es lo que está documentado en este archivo.
- **Recomendación**: elimina o mueve `Brand Identity for AGENDAM.make` (2.4 MB) fuera de esta carpeta de documentos — ya no es necesario. Este markdown lo reemplaza como referencia: es texto plano, pesa un par de KB, y contiene todo lo necesario (specs + código) para implementar la marca sin volver a llamar al MCP de Figma ni abrir el archivo `.make` en sesiones futuras. Si en algún momento se necesita reabrir el proyecto para seguir diseñando visualmente, el link de Figma de arriba es la vía — el `.make` local no aporta nada que el link no dé.

## 1. Concepto de marca

Software de gestión para consultorios médicos independientes. Dirección visual: **Glassmorphism · Premium · Confiable**.

## 2. Paleta de color

| Hex | Nombre | Rol |
|---|---|---|
| `#B2D5E5` | Azul Principal | Marca · fondos · degradados |
| `#2F6F94` | Azul Funcional | CTA · texto · bordes activos |
| `#D4537E` | Rosa Acento | Logo · énfasis de marca |
| `#FBEAF0` | Rosa Claro | Fondos suaves · degradados |
| `#FAF9F7` | Blanco Cálido | Superficies translúcidas |

Fondo oscuro base de la marca (usado en la página de identidad y tarjeta de marca): `#0B1829` (con glows radiales en azul/rosa a baja opacidad).

## 3. Tipografía

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
```

- **Nunito** (400/500/600/700) — tipografía principal: wordmark, títulos, cuerpo de texto.
- **DM Mono** (300/400/500, itálica 300) — labels técnicos, kickers, metadatos (todo mayúsculas, tracking amplio).

## 4. Isotipo — grid de puntos ("@")

El isotipo es una "@" construida sobre una cuadrícula de puntos (dot-matrix), no una imagen — es 100% SVG generado por código, por lo que **no requiere ningún asset exportado**.

- Grid: 8 columnas × 8 filas (cols/rows 0–7). ViewBox `0 0 90 90`.
- Cada punto: `cx = col*10 + 10`, `cy = row*10 + 10`, `r = 4` (gap de 2px entre puntos).
- Dos colores: puntos exteriores (`outerColor`, azul `#2F6F94` por defecto) y puntos que forman la "a" interior (`innerColor`, rosa `#D4537E` por defecto). Existe también una variante `monoColor` de un solo color para impresión/sello.

Coordenadas exactas (`[col, row]`):

```
R0 top arc:        [1,0][2,0][3,0][4,0][5,0][6,0]
R1 outer sides:     [0,1][1,1]              [6,1][7,1]
R2 left+innerA-top: [0,2][1,2]  [3,2][4,2][5,2]  [7,2]
R3 left+innerA-mid: [0,3][1,3]  [3,3]     [5,3]  [7,3]
R4 left+innerA-bot: [0,4][1,4]  [3,4][4,4][5,4]
R5 left only:       [0,5][1,5]
R6 bottom sweep:          [1,6][2,6][3,6][4,6][5,6][6,6][7,6]
R7 tail:                                      [5,7][6,7][7,7]
```

("a" interior = puntos en `{3,2 4,2 5,2 3,3 5,3 3,4 4,4 5,4}`.)

## 5. Componentes de referencia (React + inline styles)

Código extraído tal cual del proyecto de Figma Make — listo para adaptarse al stack real (Next.js + TypeScript + Tailwind, Documento 03) cuando arranque la Fase 0.

```tsx
const INNER_A = new Set(["3,2","4,2","5,2","3,3","5,3","3,4","4,4","5,4"]);

const AT_DOTS: readonly [number, number][] = [
  [1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
  [0,1],[1,1],                     [6,1],[7,1],
  [0,2],[1,2],      [3,2],[4,2],[5,2],     [7,2],
  [0,3],[1,3],      [3,3],     [5,3],      [7,3],
  [0,4],[1,4],      [3,4],[4,4],[5,4],
  [0,5],[1,5],
             [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],
                                   [5,7],[6,7],[7,7],
];

function AgendamMark({
  size = 60,
  outerColor = "#2F6F94",
  innerColor = "#D4537E",
  monoColor, // si se pasa, anula los dos colores (uso en imprenta/icon)
}: { size?: number; outerColor?: string; innerColor?: string; monoColor?: string }) {
  return (
    <svg viewBox="0 0 90 90" width={size} height={size} style={{ display: "block", flexShrink: 0 }}>
      {AT_DOTS.map(([col, row], i) => {
        const isInner = INNER_A.has(`${col},${row}`);
        const fill = monoColor ?? (isInner ? innerColor : outerColor);
        return <circle key={i} cx={col * 10 + 10} cy={row * 10 + 10} r={4} fill={fill} />;
      })}
    </svg>
  );
}

// Logotipo completo: isotipo + wordmark Nunito
function Logotype({
  markSize = 60,
  textColor = "#2F6F94",
  monoMark,
}: { markSize?: number; textColor?: string; monoMark?: string }) {
  const fontSize = Math.round(markSize * 0.58);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(markSize * 0.22) }}>
      <AgendamMark size={markSize} monoColor={monoMark} />
      <span style={{
        fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize,
        letterSpacing: "0.16em", color: textColor, lineHeight: 1, userSelect: "none",
      }}>
        AGENDAM
      </span>
    </div>
  );
}

// Logotipo compacto para nav / contextos pequeños
function SmallLogotype({
  markSize = 26, monoMarkColor, textColor = "#FAF9F7", fontSize = 12,
}: { markSize?: number; monoMarkColor?: string; textColor?: string; fontSize?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(markSize * 0.3) }}>
      <AgendamMark size={markSize} monoColor={monoMarkColor} />
      <span style={{
        fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize,
        letterSpacing: "0.18em", color: textColor, lineHeight: 1, userSelect: "none",
      }}>
        AGENDAM
      </span>
    </div>
  );
}

// Ícono de app (iOS / squircle) — degradado azul→rosa evitando morado
function IOSIcon({ size = 200 }: { size?: number }) {
  const br = Math.round(size * 0.225);
  const markSize = Math.round(size * 0.52);
  return (
    <div style={{
      width: size, height: size, borderRadius: br, overflow: "hidden",
      position: "relative", flexShrink: 0,
      boxShadow: `0 ${size * 0.1}px ${size * 0.3}px rgba(47,111,148,0.3), 0 ${size * 0.03}px ${size * 0.1}px rgba(0,0,0,0.5)`,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(145deg, #C0DAE8 0%, #6AAACB 40%, #5A9CBF 65%, #A07898 83%, #C27490 100%)",
      }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AgendamMark size={markSize} monoColor="rgba(255,255,255,0.92)" />
      </div>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 42%, transparent 58%)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 -8px 20px rgba(0,0,0,0.14)", pointerEvents: "none" }} />
    </div>
  );
}
```

## 6. Reglas de uso

- **Fondo blanco / claro** (`#FAF9F7` o superficies claras): isotipo bicolor (azul/rosa) + wordmark en azul funcional `#2F6F94`.
- **Fondo con degradado** (`linear-gradient(130deg, #B2D5E5 0%, #FBEAF0 100%)`): mismo tratamiento, isotipo bicolor + wordmark azul.
- **Versión plana / un solo color** (impresión, sello, membrete, favicon): usar `monoMark` — típicamente `#2F6F94` (azul) o `#1a1a1a` (negro) sobre fondo claro. Es la versión obligatoria para el membrete de receta médica (Documento 01, hallazgo de Fase 7).
- **Ícono de app**: siempre el degradado azul→rosa con el mark en blanco `rgba(255,255,255,0.92)` centrado; nunca sustituir por el isotipo bicolor.
- **Nav / contextos compactos**: usar `SmallLogotype` (mark ~26px, texto ~12px, tracking 0.18em) en vez de `Logotype` completo.
- Texto del wordmark siempre en mayúsculas, Nunito 700, tracking ancho (0.16–0.18em) — nunca condensar el tracking.

## 7. Aplicación de referencia vista en Figma Make

El proyecto de Figma Make (`App.tsx`) muestra 6 secciones de aplicación de la marca, útiles como checklist de piezas a producir cuando se necesiten:

1. **01–02 Logotipo**: sobre fondo blanco y sobre degradado azul→rosa.
2. **03–04 Ícono de app + versión plana**: ícono iOS en 3 tamaños (200/72/40px) y versión de un solo color para impresión.
3. **05 Membrete de receta médica**: layout tipo receta (encabezado con logo plano + datos del médico, campos PACIENTE/FECHA/EDAD, DIAGNÓSTICO, Rp/, firma y sello, pie con dirección/teléfono) — referencia directa para la Fase 7 (Documento 01 §14, Documento 03 roadmap).
4. **06 Tarjeta de marca**: logo + claim + ícono de app + paleta de color, formato "brand card" para compartir la identidad.

## 8. Próximo paso

Estos componentes y tokens quedan listos para copiarse dentro de `src/components/brand/` (o equivalente) cuando arranque la **Fase 0** del roadmap (Documento 03 §5) — no bloquean ni requieren decisiones adicionales.
