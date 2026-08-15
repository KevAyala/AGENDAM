/**
 * Alta manual del primer usuario Administrador (Fase 0 — no hay pantalla de
 * "crear usuario" todavía). El usuario debe existir antes en Supabase Auth
 * (Authentication → Users → Add user) — este script solo crea su fila
 * correspondiente en la tabla `usuarios`, usando el mismo id (uid) que le
 * asignó Supabase Auth.
 *
 * Uso: npx tsx scripts/create-admin.ts --id=<uid-de-supabase> --nombre="<nombre>" --email=<email> [--rol=ADMIN]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArgs() {
  const args = new Map<string, string>();
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args.set(match[1], match[2]);
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const id = args.get("id");
  const nombre = args.get("nombre");
  const email = args.get("email");
  const rol = (args.get("rol") ?? "ADMIN") as "ADMIN" | "MEDICO" | "RECEPCION";

  if (!id || !nombre || !email) {
    console.error(
      'Uso: npx tsx scripts/create-admin.ts --id=<uid-de-supabase> --nombre="<nombre>" --email=<email> [--rol=ADMIN]',
    );
    process.exit(1);
  }

  const usuario = await prisma.usuario.upsert({
    where: { id },
    update: { nombre, email, rol },
    create: { id, nombre, email, rol },
  });

  console.log(`✓ Usuario listo: ${usuario.nombre} <${usuario.email}> — rol ${usuario.rol}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
