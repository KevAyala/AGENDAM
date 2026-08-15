# AGENDAM

Software de gestión para consultorios médicos independientes. Ver `docs/` para
la documentación de producto (visión, levantamiento, arquitectura, SRS,
identidad de marca).

## Estado

**Fase 0 — Fundaciones** (Documento 03 §5): Next.js + TypeScript + Tailwind +
Prisma andando, autenticación y roles vía Supabase Auth, bitácora de
auditoría desde el inicio, y el registro de consultorios listo para el
patrón "una base de datos por consultorio". Las fases 1 en adelante
(pacientes, agenda, turnos, WhatsApp, expediente clínico...) todavía no
están implementadas — ver Documento 03 para el roadmap completo.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend + Backend | Next.js 16 (App Router, React 19, TypeScript) |
| Estilos | Tailwind CSS v4 (tokens de marca en `src/app/globals.css`) |
| Base de datos | PostgreSQL vía Supabase (una base de datos por consultorio) |
| ORM | Prisma (`prisma/schema.prisma`) |
| Autenticación y roles | Supabase Auth |

## Arranque local

1. Crea un proyecto en [Supabase](https://supabase.com) para tu consultorio
   (Postgres + Auth).
2. Copia `.env.example` a `.env.local` (para Next.js) y a `.env` (para el
   CLI de Prisma), y llena `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` con los
   valores reales de ese proyecto.
3. Instala dependencias y aplica el esquema:
   ```
   npm install
   npm run prisma:migrate
   ```
4. Da de alta el primer usuario: créalo en Supabase Auth (Authentication →
   Users) y agrega su fila correspondiente en la tabla `usuarios` (mismo
   `id` que el uid de Supabase Auth, con `rol = ADMIN`) — vía
   `npm run prisma:studio` o un `INSERT` directo. El alta de usuarios es
   manual en el MVP (no hay pantalla de "crear usuario" todavía).
5. Levanta el servidor de desarrollo:
   ```
   npm run dev
   ```

## Estructura

```
docs/                     Documentación de producto (Documentos 01-05)
config/tenants.ts         Registro de consultorios (Documento 03 §3)
scripts/add-tenant.ts     Runbook de alta manual de un consultorio nuevo
prisma/schema.prisma      Esquema de la base de datos de un consultorio
src/app/                  Rutas (App Router)
src/lib/supabase/         Clientes de Supabase (browser/server/middleware)
src/lib/prisma.ts         Cliente de Prisma (singleton)
src/lib/audit.ts          Helper único para escribir en la bitácora de auditoría
src/components/brand/     Componentes de la identidad de marca (Documento 05)
```

## Multi-tenant: una base de datos por consultorio

Cada consultorio tiene su propio proyecto de Supabase (Postgres + Auth) y su
propio despliegue de Vercel — mismo repositorio, variables de entorno
distintas. Para dar de alta un consultorio nuevo:

```
npm run tenant:add -- --id=<id> --nombre="<nombre>" --dominio=<dominio> --supabaseProjectRef=<ref>
```

Esto agrega la entrada a `config/tenants.ts` (deja rastro en el código) y
lista los pasos manuales restantes (crear proyecto de Supabase, correr
migraciones, crear el despliegue de Vercel, dar de alta el primer Admin).
Ver Documento 03 §3 para el detalle de esta decisión.

## Despliegue (Vercel)

Sin configuración adicional de `vercel.json` — Next.js se detecta
automáticamente. Antes de desplegar:

1. Conecta el repositorio a un proyecto de Vercel (uno por consultorio).
2. Configura las mismas variables de `.env.example` en ese proyecto de
   Vercel.
3. Corre `npm run prisma:migrate` contra la base de datos de ese
   consultorio antes del primer despliegue (o agrégalo como paso de build).
