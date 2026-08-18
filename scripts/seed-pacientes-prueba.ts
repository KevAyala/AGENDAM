// Datos de prueba — 10 pacientes ficticios para probar Agenda/Turnos/Lista
// de espera sin usar datos reales de personas. Idempotente: si ya existe un
// paciente con el mismo nombre+apellidos+teléfono, lo salta.
// Uso: npx tsx scripts/seed-pacientes-prueba.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PACIENTES_PRUEBA = [
  { nombre: "Luis", apellidos: "Hernández Ramos", telefono: "3312345601", fechaNacimiento: "1985-03-14" },
  { nombre: "María José", apellidos: "García Torres", telefono: "3312345602", fechaNacimiento: "1990-07-22" },
  { nombre: "Andrea", apellidos: "López Vega", telefono: "3312345603", fechaNacimiento: "1978-11-02" },
  { nombre: "Carlos", apellidos: "Martínez Solís", telefono: "3312345604", fechaNacimiento: "1965-01-30" },
  { nombre: "Sofía", apellidos: "Reyes Padilla", telefono: "3312345605", fechaNacimiento: "2019-05-09" },
  { nombre: "Diego", apellidos: "Morales Cruz", telefono: "3312345606", fechaNacimiento: "2016-09-17" },
  { nombre: "Fernanda", apellidos: "Jiménez Ortiz", telefono: "3312345607", fechaNacimiento: "1995-12-25" },
  { nombre: "Roberto", apellidos: "Castillo Nuño", telefono: "3312345608", fechaNacimiento: "1958-06-11" },
  { nombre: "Paola", apellidos: "Vázquez Medina", telefono: "3312345609", fechaNacimiento: "2001-02-19" },
  { nombre: "Jorge", apellidos: "Delgado Aceves", telefono: "3312345610", fechaNacimiento: "1972-08-04" },
];

async function main() {
  for (const p of PACIENTES_PRUEBA) {
    const existente = await prisma.paciente.findFirst({
      where: { nombre: p.nombre, apellidos: p.apellidos, telefono: p.telefono },
    });
    if (existente) {
      console.log(`↷ ya existe: ${p.nombre} ${p.apellidos}`);
      continue;
    }
    await prisma.paciente.create({
      data: {
        nombre: p.nombre,
        apellidos: p.apellidos,
        telefono: p.telefono,
        fechaNacimiento: new Date(p.fechaNacimiento),
        notas: "Paciente de prueba — datos ficticios (scripts/seed-pacientes-prueba.ts)",
      },
    });
    console.log(`✓ creado: ${p.nombre} ${p.apellidos}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
