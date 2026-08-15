# AGENDAM
## Documento 02 — Guía de Levantamiento de Requerimientos
Versión 1.0 | Estado: Aplicado | Agosto 2026

---

## 0. Estado de avance

Todos los bloques de esta guía fueron respondidos directamente en conversación con el usuario. Las respuestas están incorporadas en el **Documento 04 — SRS v0.3** (requisitos) y en el **Documento 01 — v0.5, sección 14** (hallazgos de contexto que no generan un requisito nuevo).

| Bloque | Estado | Dónde quedó registrado |
|---|---|---|
| A — Flujo actual de citas | ✅ Completo | SRS v0.3, secciones 2 y 3.4 (RF-035b) |
| B — Turnos y sala de espera | ✅ Completo | SRS v0.3, sección 3.4 |
| C — Pacientes y expediente | ✅ Completo | SRS v0.3, sección 3.6; Doc 01 v0.5 sección 14 |
| D — Consulta médica y receta | ✅ Completo | SRS v0.3, secciones 3.4 y 3.6 |
| E — Comunicación interna | ✅ Completo | SRS v0.3, sección 3.8 (contexto; RF-060 ya cubre el chat interno) |
| F — Confirmaciones WhatsApp | ✅ Completo | SRS v0.3, sección 3.5 (incluye advertencia técnica de coexistencia) |
| G — Horarios y calendario | ✅ Completo | SRS v0.3, sección 3.3 (RF-029a, RF-029b) |
| H — Administración y accesos | ✅ Completo | SRS v0.3, sección 5 |
| I — Volumen y contexto operativo | ✅ Completo | Doc 01 v0.5 sección 14; SRS v0.3 sección 8 |
| J — Prioridades del consultorio | ✅ Completo | Confirma que turnos + confirmaciones es la prioridad #1, ya reflejado en el orden del roadmap (Documento 03) |

**Único punto que queda genuinamente abierto**: la fuente del contenido inicial del catálogo de medicamentos (no bloquea desarrollo).

---

## 1. Propósito de este documento

Antes de construir el SRS (Documento 03), es necesario entender **cómo funciona realmente el consultorio hoy**, para que los requisitos de AGENDAM respondan a procesos reales y no a supuestos.

Esta guía está organizada por bloque temático. Se recomienda aplicarla como entrevista con recepción y con cada médico por separado, ya que sus perspectivas del mismo proceso pueden diferir.

**Cómo usarla**: cada pregunta tiene espacio para respuesta. Las preguntas marcadas con 🔑 son las que más impactan decisiones de diseño ya identificadas en el Documento 01 (ver sección 13, "Decisiones de producto pendientes").

---

## 2. Bloque A — Flujo actual de citas

1. ¿Cómo se agenda una cita hoy? (teléfono, WhatsApp, presencial, otro)
2. ¿Quién agenda las citas — siempre recepción, o a veces el médico directamente?
3. ¿Cuánto dura normalmente una cita? 🔑 ¿Es igual para todos los médicos o varía?
4. ¿Existen distintos tipos de consulta (primera vez, seguimiento, urgencia) con duración distinta?
5. ¿Con cuánta anticipación se agenda normalmente una cita? ¿Hay citas el mismo día?
6. ¿Qué pasa si un paciente llega sin cita?
7. ¿Actualmente confirman citas de alguna forma? ¿Cómo, y con cuánta anticipación?
8. ¿Qué tan frecuentes son las cancelaciones y las inasistencias (no-shows)?
9. ¿Qué hacen hoy cuando alguien cancela — se ofrece el horario a alguien más?

## 3. Bloque B — Turnos y sala de espera 🔑

10. ¿Existe hoy algún concepto de "turno" o número de atención, aunque sea informal?
11. Cuando llegan varios pacientes, ¿cómo se decide el orden de atención?
12. ¿Se atiende siempre por orden de cita, o hay criterios de prioridad (adulto mayor, urgencia, embarazo, etc.)?
13. ¿Se permite hoy la atención rápida sin cita previa? ¿Bajo qué criterio?
14. ¿Hay una sala de espera física? ¿Cuántas personas caben normalmente esperando?
15. ¿Cómo se avisa hoy a un paciente que ya le toca pasar (se le llama por nombre, hay pantalla, otro método)?
16. Si un consultorio tiene más de un médico atendiendo simultáneamente, ¿comparten la misma sala de espera?

> Nota de diseño: las respuestas de este bloque determinan si el módulo de "sala de espera con pantalla pública y prioridades" debe ir en el MVP o puede moverse a una fase posterior (ver Documento 01, sección 8).

## 4. Bloque C — Pacientes y expediente

17. ¿Qué datos del paciente registran actualmente al momento de agendar o atender por primera vez?
18. ¿Guardan hoy alergias, antecedentes o algo similar? ¿Dónde (papel, Excel, memoria del doctor)?
19. ¿Un mismo paciente puede ser atendido por más de un médico del consultorio? ¿Con qué frecuencia pasa esto?
20. Si eso pasa, ¿el segundo médico necesita ver lo que registró el primero, o son independientes?
21. ¿Cómo identifican hoy a un paciente que ya ha venido antes (nombre, teléfono, algún folio)?

## 5. Bloque D — Consulta médica y receta 🔑

22. Al atender, ¿qué información registra el médico hoy (a mano, en computadora, no registra nada)?
23. ¿Se registran signos vitales de forma rutinaria?
24. Cuando se emite una receta, ¿es un papel físico que se lleva el paciente, un documento impreso desde computadora, o solo se dice de palabra?
25. ¿La receta necesita algún formato específico (membrete, cédula profesional, firma) por requisito legal o de la farmacia?
26. ¿Usan hoy algún catálogo o lista fija de medicamentos, o el médico escribe libremente?
27. Si el paciente surte la receta en la misma farmacia, ¿existe hoy alguna conexión entre lo que receta el doctor y lo que se surte, aunque sea informal?

## 6. Bloque E — Comunicación interna

28. Hoy, cuando recepción necesita avisarle algo al médico durante consulta (paciente urgente, cambio de horario), ¿cómo lo hace?
29. ¿El médico necesita avisar a recepción algo durante o después de la consulta (ej. "dame 10 minutos más", "próxima cita en 2 semanas")?

## 7. Bloque F — Confirmaciones por WhatsApp 🔑

30. ¿Actualmente usan WhatsApp para algo relacionado con el consultorio? ¿De qué número (personal, de negocio)?
31. ¿Con cuánta anticipación les gustaría que se envíe el recordatorio/confirmación?
32. Si el paciente no responde al recordatorio, ¿prefieren que el sistema reintente, que le avise a recepción para llamar, o ambos?
33. ¿Debe el paciente poder reagendar o cancelar directamente respondiendo el WhatsApp, o solo confirmar/cancelar?

## 8. Bloque G — Horarios y calendario 🔑

34. ¿Cada médico tiene un horario fijo, o varía semana a semana?
35. ¿Hoy usan Google Calendar o algún otro calendario digital? ¿Quién lo consulta?
36. Si se integra con Google Calendar, ¿es para que el médico vea su agenda ahí, para que recepción programe desde ahí, o ambos?
37. ¿Los médicos atienden en más de un consultorio o ubicación?

## 9. Bloque H — Administración y accesos

38. ¿Quién debería poder ver el expediente clínico completo? ¿Recepción debería verlo, o solo datos administrativos (nombre, teléfono, cita)?
39. ¿Hay información que un médico no debería poder ver de pacientes que no ha atendido él mismo?
40. ¿Quién da de alta a un médico nuevo si se incorpora al consultorio?

## 10. Bloque I — Volumen y contexto operativo

41. ¿Cuántas citas se atienden aproximadamente al día / por médico?
42. ¿Cuántos médicos atienden actualmente, y con qué especialidad cada uno?
43. ¿El consultorio tiene un horario fijo de operación (días y horas)?
44. ¿Hay temporadas de mayor demanda (fin de mes, ciertos días de la semana)?

## 11. Bloque J — Prioridades del propio consultorio

45. Si solo pudieran resolver **una** cosa primero con este sistema, ¿cuál sería?
46. ¿Qué es lo que más tiempo o dolores de cabeza les quita hoy en el proceso actual?
47. ¿Hay algo que definitivamente NO quieren que cambie de cómo trabajan hoy?

---

## 12. Siguiente paso

Con las respuestas de esta guía, se debe:

1. Actualizar el Documento 01 (Visión y Alcance) si alguna respuesta cambia el alcance del MVP — en particular los puntos marcados 🔑.
2. Construir el Documento 03 (SRS) con requisitos funcionales concretos basados en el proceso real, no en supuestos.
