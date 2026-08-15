// Catálogo inicial de TipoConsulta — RF-028 (Documento 04 §3.3).
// Uso: npx tsx prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATALOGO = [
  { nombre: "Consulta general", duracionMin: 20, requiereAgenda: true },
  { nombre: "Consulta general", duracionMin: 40, requiereAgenda: true },
  { nombre: "Consulta pediátrica", duracionMin: 20, requiereAgenda: true },
  { nombre: "Consulta pediátrica", duracionMin: 40, requiereAgenda: true },
  { nombre: "Procedimiento médico", duracionMin: 20, requiereAgenda: true },
  { nombre: "Procedimiento médico", duracionMin: 40, requiereAgenda: true },
  { nombre: "Procedimiento médico", duracionMin: 60, requiereAgenda: true },
  // RF-039: las aplicaciones no se agendan, se atienden por orden de
  // llegada (Fase 2) — se cataloga desde ahora porque es parte del mismo
  // diccionario de datos (§6.3a).
  { nombre: "Aplicación", duracionMin: 5, requiereAgenda: false },
];

async function main() {
  for (const tipo of CATALOGO) {
    const existente = await prisma.tipoConsulta.findFirst({
      where: { nombre: tipo.nombre, duracionMin: tipo.duracionMin },
    });
    if (existente) continue;
    await prisma.tipoConsulta.create({ data: tipo });
    console.log(`✓ ${tipo.nombre} — ${tipo.duracionMin} min`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
