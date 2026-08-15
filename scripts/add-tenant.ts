/**
 * Runbook de alta manual de un consultorio nuevo (Documento 03 §3).
 * Uso: npm run tenant:add -- --id=farmacia-xyz --nombre="Farmacia XYZ" --dominio=farmacia-xyz.agendam.app --supabaseProjectRef=abcdefghijklmnop
 *
 * Este script NO crea el proyecto de Supabase ni el proyecto de Vercel por
 * ti (requiere tus credenciales de las consolas respectivas) — automatiza
 * la parte que sí puede quedar en código: agregar la entrada a
 * config/tenants.ts para que quede registrada, y recordarte los pasos
 * manuales restantes en orden.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function parseArgs() {
  const args = new Map<string, string>();
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args.set(match[1], match[2]);
  }
  return args;
}

function main() {
  const args = parseArgs();
  const id = args.get("id");
  const nombre = args.get("nombre");
  const dominio = args.get("dominio");
  const supabaseProjectRef = args.get("supabaseProjectRef");

  if (!id || !nombre || !dominio || !supabaseProjectRef) {
    console.error(
      "Uso: npm run tenant:add -- --id=<id> --nombre=<nombre> --dominio=<dominio> --supabaseProjectRef=<ref>",
    );
    process.exit(1);
  }

  const tenantsPath = resolve(process.cwd(), "config/tenants.ts");
  const contenido = readFileSync(tenantsPath, "utf-8");
  const fechaAlta = new Date().toISOString().slice(0, 10);

  const nuevaEntrada = `  {
    id: "${id}",
    nombre: "${nombre}",
    dominio: "${dominio}",
    supabaseProjectRef: "${supabaseProjectRef}",
    activo: true,
    fechaAlta: "${fechaAlta}",
  },\n`;

  const marcador = "export const CONSULTORIOS: Consultorio[] = [";
  if (!contenido.includes(marcador)) {
    console.error("No se encontró el arreglo CONSULTORIOS en config/tenants.ts");
    process.exit(1);
  }

  const actualizado = contenido.replace(marcador, `${marcador}\n${nuevaEntrada}`);
  writeFileSync(tenantsPath, actualizado);

  console.log(`✓ Consultorio "${id}" agregado a config/tenants.ts\n`);
  console.log("Pasos manuales restantes:");
  console.log(`  1. Crear el proyecto de Supabase "${supabaseProjectRef}" (Postgres + Auth).`);
  console.log("  2. Copiar su connection string a DATABASE_URL y sus llaves a NEXT_PUBLIC_SUPABASE_* / SUPABASE_SERVICE_ROLE_KEY.");
  console.log("  3. Correr `npm run prisma:migrate` contra esa base de datos nueva.");
  console.log(`  4. Crear el proyecto de Vercel para este consultorio, apuntando al dominio "${dominio}", con esas variables de entorno.`);
  console.log("  5. Dar de alta el primer usuario Administrador en Supabase Auth y su fila correspondiente en la tabla `usuarios`.");
}

main();
