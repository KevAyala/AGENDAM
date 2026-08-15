import { PrismaClient } from "@prisma/client";

// Singleton estándar de Prisma para Next.js: evita agotar conexiones por
// los recargas en caliente de `next dev`, que re-ejecutan este módulo.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
