/**
 * Tabla de mapeo real de consultorios — Documento 03 §3.
 *
 * Estrategia multi-tenant: **una base de datos Postgres separada por
 * consultorio**, con la MISMA base de código (Documento 03 §3). En la
 * práctica esto significa un despliegue de Vercel independiente por
 * consultorio (mismo repo, distintas variables de entorno — cada uno con
 * su propio `DATABASE_URL` y su propio proyecto de Supabase), en vez de un
 * único despliegue que enrute por hostname en tiempo de ejecución.
 *
 * Este archivo es el registro de qué consultorios existen y a qué dominio
 * y proyecto de Supabase corresponde cada uno — deja rastro en el código de
 * cada alta manual, en vez de hacerse como pasos sueltos en la consola de
 * Supabase/Vercel sin dejar huella (el anti-patrón que el Documento 03
 * explícitamente pide evitar). No se usa en tiempo de ejecución dentro de
 * la app; es la fuente de verdad para quien aprovisiona un consultorio
 * nuevo (ver scripts/add-tenant.ts).
 *
 * No se construye ningún panel de administración de tenants en el MVP
 * (Documento 03 §3) — si en el futuro se automatiza el alta, esa
 * automatización solo necesita leer/escribir este mismo archivo.
 */
export type Consultorio = {
  /** Identificador corto, usado también como sufijo de proyecto en Vercel/Supabase. */
  id: string;
  nombre: string;
  /** Dominio o subdominio donde queda desplegado este consultorio. */
  dominio: string;
  /** Referencia del proyecto de Supabase (Postgres + Auth) de este consultorio. */
  supabaseProjectRef: string;
  activo: boolean;
  fechaAlta: string; // YYYY-MM-DD
};

export const CONSULTORIOS: Consultorio[] = [
  // Ejemplo — reemplazar con el primer consultorio real al desplegarlo:
  // {
  //   id: "farmacia-xyz",
  //   nombre: "Farmacia XYZ — Dra. Ana Martínez",
  //   dominio: "farmacia-xyz.agendam.app",
  //   supabaseProjectRef: "abcdefghijklmnop",
  //   activo: true,
  //   fechaAlta: "2026-08-14",
  // },
];
