# AGENDAM
## Documento 01 — Visión y Alcance del Producto
### Product Vision & Scope
Versión 0.4 | Estado: Borrador | Agosto 2026

---

## 0. Historial de cambios

| Versión | Cambios |
|---|---|
| 0.1 | Versión inicial |
| 0.2 | Estadísticas movidas a futuro; turnos confirmados como prioridad del MVP; generación de receta imprimible movida a futuro; aclaración sobre multi-tenant. |
| 0.3 | Corrección de numeración de la serie documental (el SRS pasa a ser el Documento 04). |
| 0.4 | **Se resuelven la mayoría de las "decisiones de producto pendientes"** con base en el levantamiento real del consultorio (Documento 02, aplicado por el usuario) y en decisiones de producto tomadas directamente en conversación. Detalle completo trasladado al **Documento 04 — SRS v0.2**. |
| 0.5 | **Se cierra el Documento 02 (Guía de Levantamiento) casi en su totalidad.** Catálogo de medicamentos ya no es un punto abierto de fondo (estructura y mecanismo de carga definidos); solo falta decidir la fuente del contenido inicial. Se documentan hallazgos operativos relevantes (registro clínico actual incompleto, formato de receta física existente, capacidad de sala de espera, plan de sumar un segundo médico). |

## 1. Información general

| | |
|---|---|
| Producto | AGENDAM |
| Tipo | Plataforma de gestión para consultorios médicos |
| Documento | Visión y Alcance del Producto |
| Versión | 0.4 |
| Estado | Borrador |
| Contexto inicial | Consultorio médico asociado a una farmacia, dos o más médicos en operación |
| Visión futura | Producto comercial escalable para múltiples médicos, consultorios y organizaciones |

*(Secciones 2 a 12 sin cambios respecto a v0.3 — ver ese documento para el detalle completo de visión, objetivos, roles, alcance y principios.)*

## 13. Decisiones de producto — estado actualizado

| Decisión | Estado | Resolución |
|---|---|---|
| Flujo real del consultorio | ✅ Resuelto | Flujo de 9 pasos levantado directamente con el usuario (llamada/mensaje/presencial → disponibilidad → agenda → confirmación asimétrica según turno → llegada → turno → atención → cobro en caja → salida). Detalle en Documento 04, sección 3.4. |
| Duración y tipos de atención | ✅ Resuelto | 4 tipos de servicio con distinta duración; aplicaciones no se agendan. Detalle en Documento 04, sección 3.3. |
| Reglas de turnos y prioridad | ✅ Resuelto | Orden de llegada/cita, regla de los 30 minutos para aplicaciones. Detalle en Documento 04, sección 3.4. |
| Permisos por rol | ✅ Resuelto (definido por diseño, alineado a NOM-004) | Ver Documento 04, sección 5. |
| Alcance de Google Calendar | ✅ Resuelto | Sincronización unidireccional AGENDAM → Google Calendar, solo para consulta de disponibilidad desde la app de Google Calendar. |
| Proveedor y alcance de WhatsApp | ✅ Resuelto | Mensaje con plantilla fija (confirmar / cancelar / cambiar horario); "cambiar horario" se deriva a atención humana de recepción. Sin IA por ahora. |
| Catálogo de medicamentos | ✅ Estructura resuelta | Componente, nombre comercial y concentración (mg), cargado vía CSV. Solo falta decidir la fuente del contenido inicial (armado propio vs. base externa) — no bloquea el desarrollo. |
| Número de WhatsApp a usar | ✅ Resuelto (con advertencia técnica) | Se usará el número de WhatsApp Business ya existente de la farmacia; debe verificarse la compatibilidad de "coexistencia" con el proveedor de API antes de la Fase 3 (Documento 04, sección 3.5). |
| Llegada de paciente sin cita (consulta regular) | ✅ Resuelto | Se le da lugar el mismo día si hay margen; si no, se ofrece el siguiente turno o lista de espera. |
| Requisitos del expediente clínico | ✅ Resuelto | Mínimo exigido por NOM-004-SSA3-2012: ficha de identificación, historia clínica, exploración física con signos vitales, diagnóstico/pronóstico/tratamiento, notas de evolución, datos del establecimiento. Conservación mínima de 5 años. |
| Estrategia multi-tenant | ✅ Resuelto | Misma base de código para todos los clientes; **una base de datos separada por consultorio**, aprovisionada manualmente (baja frecuencia esperada de altas de nuevos consultorios). |
| Auditoría y trazabilidad | ✅ Resuelto | Bitácora completa (logins, citas, turnos, notas clínicas). Consulta: Administrador ve todo; cada médico ve únicamente su propia actividad. |
| Arquitectura técnica y despliegue | ✅ Resuelto | Ver Documento 03 v0.2 (stack y estrategia de despliegue actualizados). |

Con esto, la única decisión genuinamente abierta es la **fuente del catálogo de medicamentos** (autoconstruido vs. base externa), que puede resolverse más adelante sin bloquear el desarrollo del MVP.

## 14. Hallazgos operativos del levantamiento (contexto, no requisitos)

- Hoy el registro clínico solo es consistente para pacientes de seguimiento; para el resto, la única constancia es la receta física entregada. AGENDAM mejora esto de forma natural al capturar expediente para todos los pacientes desde el MVP.
- La farmacia ya tiene un formato de receta en papel (con cédula profesional, nombre, universidad, etc.) que deberá replicarse cuando se construya la receta imprimible (Fase 7).
- Hay al menos una cancelación o inasistencia por día — información útil para dimensionar la lógica de lista de espera.
- La sala de espera física tiene capacidad para ~6 personas, y los pacientes casi nunca llegan solos.
- Hay planes de sumar un segundo médico a mediano plazo (no la podóloga, que opera de forma independiente); la interfaz debe estar lista para eso sin fricción en la selección de médico.
- No existe hoy relación entre lo que se receta y lo que se surte en farmacia; se identificó como mejora deseable a futuro (sin llegar a ser un sistema de inventario completo).
