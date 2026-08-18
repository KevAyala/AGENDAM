# AGENDAM
## Documento 03 — Arquitectura Técnica y Roadmap de Desarrollo
Versión 0.2 | Estado: Borrador | Agosto 2026

---

## 0. Historial de cambios

| Versión | Cambios |
|---|---|
| 0.1 | Versión inicial (stack propuesto y roadmap por fases). |
| 0.2 | Estrategia multi-tenant actualizada a **base de datos separada por consultorio** (en vez de fila compartida con `organizacion_id`), aprovisionada manualmente. Se agrega estrategia de auditoría/trazabilidad y principio de diseño explícito: el aprovisionamiento manual se hace mediante scripts y una tabla de mapeo reales desde el MVP, para que una futura automatización no requiera rediseño. |
| 0.3 | Se cierra el levantamiento (Documento 02). Se agrega advertencia técnica sobre coexistencia de WhatsApp Business, importación CSV de catálogo de medicamentos, y nota de UX sobre selección rápida de médico ante crecimiento a más de uno. |
| 0.4 | Se agrega el componente de **IA para clasificación de intención en WhatsApp** (modelo híbrido IA + humano) al stack y al roadmap de la Fase 3. |
| 0.5 | Al implementar la Fase 3 se acuerdan dos desviaciones temporales respecto a RF-041/RF-045 (Documento 04), documentadas en detalle en `src/lib/whatsapp.ts`: (1) se usa el **WhatsApp Sandbox de Twilio** en vez del número real de la farmacia, para no arriesgarlo mientras se prueba el flujo; (2) se difiere el **clasificador de intención por IA** — el paciente responde un menú cerrado (1/2/3 = confirmar/reagendar/cancelar) en vez de lenguaje libre. Migrar a número real y/o agregar el clasificador de IA no requiere rediseño: el modelo de datos (`EstadoConfirmacionWsp`, `MensajeWhatsapp`) ya está listo para ambos. |

## 1. Contexto de esta decisión

- Desarrollo: una sola persona, apoyada en Claude Code.
- Despliegue: en la nube.
- Multi-tenant futuro: baja frecuencia esperada de altas de nuevos consultorios → aprovisionamiento manual es aceptable, no se necesita automatizar el alta de tenants en el MVP.

## 2. Stack propuesto (sin cambios respecto a v0.1)

| Capa | Tecnología |
|---|---|
| Frontend + Backend | Next.js (React + TypeScript) |
| Estilos / UI | Tailwind CSS |
| Base de datos | PostgreSQL (vía Supabase o Neon) |
| ORM | Prisma |
| Autenticación y roles | Supabase Auth o NextAuth |
| Tiempo real (turnos) | Supabase Realtime o Pusher |
| WhatsApp | WhatsApp Business API vía Twilio |
| Google Calendar | Google Calendar API (sincronización unidireccional) |
| **IA — clasificación de intención WhatsApp** | **API de Anthropic (modelo Claude, tamaño pequeño/económico)**, invocada desde el webhook que recibe las respuestas de WhatsApp vía Twilio |
| Hosting | Vercel (app) + Supabase/Neon (base de datos) |

## 3. Estrategia multi-tenant: base de datos separada por consultorio

**Decisión**: una sola base de código (un solo proyecto Next.js) sirve a todos los consultorios, pero **cada consultorio tiene su propia base de datos** — no se comparte una base de datos con un campo `organizacion_id` como se planteó en v0.1.

**Cómo funciona en la práctica**:
- Al desplegar AGENDAM para un consultorio nuevo, se crea una base de datos Postgres nueva (un proyecto Supabase/Neon nuevo) y se ejecuta el mismo esquema Prisma sobre ella.
- La aplicación necesita saber, al recibir una solicitud, a qué base de datos conectarse. Esto se resuelve típicamente por subdominio o dominio propio (ej. `farmacia-xyz.amed.app` → conecta a la base de datos del consultorio correspondiente) mediante una tabla de configuración central pequeña (solo mapea dominio → credenciales de base de datos), separada de los datos clínicos.
- Como el alta de consultorios nuevos es poco frecuente, este mapeo puede administrarse manualmente (tú mismo agregas la entrada) sin necesidad de un panel de aprovisionamiento automático en el MVP.

**Ventajas de este enfoque**: aislamiento total de datos clínicos entre consultorios (más simple de justificar ante cualquier auditoría de privacidad), respaldo y borrado independientes por cliente, y si un consultorio deja de usar AGENDAM, se elimina su base de datos sin tocar las demás.

**Costo de este enfoque**: cada base de datos nueva implica un paso manual de aprovisionamiento (aceptable dado el volumen esperado) y las migraciones de esquema (cambios futuros a las tablas) deben aplicarse a cada base de datos individualmente — vale la pena tener un script simple para esto desde ahora, aunque solo exista una base de datos al día de hoy.

**Principio de diseño — escalable sin sobre-construir**: el alta manual de un consultorio (crear base de datos, correr migraciones, registrar el dominio) debe hacerse desde ahora mediante **scripts y una tabla de mapeo real** (dominio → credenciales de base de datos), no como pasos sueltos hechos directamente en la consola de Supabase/Neon sin dejar rastro en el código. Esto significa que no se construye ningún panel de administración de tenants en el MVP, pero si en el futuro se decide automatizar el alta de consultorios (un botón "Nuevo consultorio"), esa automatización solo necesita ponerle una interfaz a scripts que ya existen y ya se usan — no una reescritura de la arquitectura.

## 3a. Notas técnicas adicionales del levantamiento

- **WhatsApp Business existente**: se usará el mismo número que ya opera la farmacia. Antes de la Fase 3, verificar con el proveedor (Twilio u otro) si soportan la función de **coexistencia** de Meta (app + API sobre el mismo número); si no, considerar un número secundario dedicado a los mensajes automatizados. Ver detalle en Documento 04, sección 3.5.
- **Catálogo de medicamentos**: se implementa como tabla simple (componente, nombre comercial, mg) con importación desde CSV (librería `papaparse`, ya contemplada en el stack para otros usos). No requiere integración con ninguna base de datos externa en el MVP.
- **UX de selección de médico**: con la intención de sumar un segundo médico a mediano plazo, la interfaz de agenda y turnos debe evitar que elegir el médico sea un paso lento (selector prominente, recordar la última selección) — se anota como criterio de diseño para la Fase 1 y 2.
- **Patrón híbrido IA + humano en WhatsApp**: la respuesta del paciente llega al webhook de Twilio → se envía al modelo de IA solo para **clasificar la intención** (confirmar / cancelar / cambiar horario / no entendido), nunca para conversar libremente ni dar información clínica. Si la intención es clara (confirmar/cancelar), el sistema actúa solo. Si no, marca la conversación como "pendiente de atención humana" y **deja de responder automáticamente en ese hilo** — recepción sigue la conversación desde su WhatsApp Business normal, sin que la IA interfiera. Esto requiere que la coexistencia de número (ver advertencia arriba) funcione, ya que ambos canales (IA vía API, humano vía app) comparten el mismo número.

## 4. Estrategia de auditoría y trazabilidad

- Se agrega una tabla `BitacoraAuditoria` (ver Documento 04, diccionario de datos) dentro de la base de datos de cada consultorio.
- Se registra automáticamente: inicio de sesión, creación/reprogramación/cancelación de citas, cambios de estado de turno, y creación/edición de notas clínicas (diagnóstico, tratamiento, receta).
- Implementación sugerida: middleware o hooks a nivel de Prisma (o de las rutas de API en Next.js) que escriban en `BitacoraAuditoria` en cada operación relevante, en vez de depender de que cada función individual lo haga manualmente (reduce el riesgo de que se le olvide registrar algo).
- Consulta: el Administrador ve toda la bitácora; cada médico ve únicamente los registros donde él es el actor.
- Retención sugerida: alineada con la del expediente clínico (mínimo 5 años), dado que puede ser evidencia relevante en caso de una disputa o revisión.

## 5. Roadmap de desarrollo (sin cambios de fondo respecto a v0.1)

### Fase 0 — Fundaciones
- Next.js + TypeScript + Tailwind + Prisma.
- Modelo de datos inicial por consultorio (una base de datos por cliente desde el diseño).
- Autenticación y roles.
- Tabla de bitácora de auditoría desde el inicio (no como añadido posterior).
- Despliegue base en Vercel + base de datos en la nube.

### Fase 1 — Núcleo: Pacientes y Agenda
- Registro y búsqueda de pacientes.
- Agenda por médico (dos o más médicos).
- Tipos de consulta con su duración (normal 20/40, pediátrica 20/40, procedimiento 20/40/60).
- Crear, reprogramar, cancelar citas; estados de cita.

### Fase 2 — Turnos (prioridad confirmada)
- Registro de llegada, generación de turno, cola de espera por orden de llegada/cita.
- Aplicaciones (5 min, sin agenda) con regla de inserción condicionada a los 30 minutos.
- Monto a cobrar registrado por el médico, visible para recepción.

### Fase 3 — Confirmaciones por WhatsApp
- Envío con plantilla fija; horario de envío distinto según turno matutino/vespertino.
- Clasificación de intención por IA (confirmar/cancelar/cambiar horario/no entendido) sobre respuestas en lenguaje natural.
- Actuación automática cuando la intención es clara; escalación inmediata a recepción (con pausa de la IA en ese hilo) cuando no lo es.

### Fase 4 — Consulta médica y expediente clínico
- Campos mínimos NOM-004 (ficha de identificación, historia clínica, exploración, diagnóstico, notas de evolución).
- Historial visible entre médicos del mismo consultorio.

### Fase 5 — Comunicación interna y Google Calendar
- Chat simple recepción-médico.
- Sincronización unidireccional AGENDAM → Google Calendar.

### Fase 6 — Pantalla pública de sala de espera
- Cuando se consiga la TV/monitor.

### Fase 7 — Funciones futuras
- Generación e impresión de receta con formato oficial.
- Estadísticas y reportes.
- Catálogo de medicamentos externo (si se decide integrarlo).
- Aprovisionamiento semi-automático de nuevos consultorios (si el ritmo de ventas lo justifica).

## 6. Siguiente paso

Con esta versión ya se puede iniciar la Fase 0 en Claude Code, incluyendo desde el principio la tabla de auditoría y el diseño de "una base de datos por consultorio" (aunque hoy solo exista una).
