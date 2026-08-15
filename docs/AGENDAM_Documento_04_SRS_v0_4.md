# AGENDAM
## Documento 04 — SRS (Especificación de Requisitos de Software)
Versión 0.2 | Estado: Borrador | Agosto 2026

---

## 0. Historial de cambios

| Versión | Cambios |
|---|---|
| 0.1 | Versión inicial con requisitos funcionales, no funcionales y diccionario de datos. |
| 0.2 | Se incorpora el flujo real del consultorio, tipos y duración de consulta, regla de cobro visible para recepción, reglas exactas de turnos/prioridad, permisos por rol (definidos), alcance de Google Calendar y WhatsApp, requisitos mínimos NOM-004 del expediente, y módulo de auditoría/trazabilidad. Se elimina la mayoría de los puntos abiertos de la v0.1. |
| 0.3 | Se cierra el Documento 02 (Guía de Levantamiento) casi por completo: llegada sin cita para consulta regular, lista de espera para huecos de cancelación, estructura del catálogo de medicamentos (CSV), horarios reales de operación, formato de receta en papel a replicar a futuro, vínculo receta-surtido como función futura, capacidad de sala de espera, y UX de selección de médico. Se agrega advertencia técnica sobre el número de WhatsApp Business existente. |
| 0.4 | El módulo de WhatsApp pasa de "reglas fijas + escalación total a humano" a un modelo híbrido: **IA como primera línea** (clasificador de intención en lenguaje natural) + **entrega inmediata y completa a recepción** cuando la IA no está segura o el paciente pide otra cosa, con pausa automática de la IA en esa conversación para evitar respuestas cruzadas. |

## 1. Propósito y alcance

Este SRS detalla los requisitos funcionales y no funcionales de AGENDAM para las Fases 0 a 5 del roadmap (Documento 03 v0.2), que constituyen el MVP.

---

## 2. Flujo real del consultorio (referencia para todo el módulo de agenda/turnos)

1. El paciente solicita cita por llamada, mensaje o de forma presencial.
2. Se le informan los horarios disponibles.
3. Se agenda la cita.
4. Confirmación asimétrica según el turno de la cita:
   - Cita matutina → se confirma la tarde-noche del día anterior.
   - Cita vespertina → se confirma la mañana del mismo día.
5. El paciente llega a su cita.
6. Se le indica después de qué paciente sigue.
7. Es atendido.
8. Compra medicamento y paga la consulta en caja (farmacia).
9. Se retira.

---

## 3. Requisitos funcionales

### 3.1 Módulo — Usuarios y acceso (Fase 0)
*(sin cambios respecto a v0.1: RF-001 a RF-005)*

### 3.2 Módulo — Pacientes (Fase 1)
*(sin cambios respecto a v0.1: RF-010 a RF-015)*

### 3.3 Módulo — Agenda y citas (Fase 1)

| ID | Requisito | Actor | Prioridad |
|---|---|---|---|
| RF-020 a RF-027 | *(sin cambios respecto a v0.1)* | | |
| RF-028 | El sistema debe soportar los siguientes tipos de servicio agendable, cada uno con su duración: Consulta general (20 o 40 min), Consulta pediátrica (20 o 40 min), Procedimiento médico (20, 40 o 60 min). | Recepción | Esencial |
| RF-029 | El precio no se gestiona en la agenda; la diferencia de tarifa entre consulta general y pediátrica se cobra en caja (fuera de AGENDAM en el MVP). | Sistema | Esencial |
| RF-039 | Las "aplicaciones" (5 min) no se agendan; se atienden por orden de llegada según la regla de turnos (sección 3.4). | Sistema | Esencial |
| RF-029a | La agenda completa (calendario, horarios, citas) debe poder consultarse de forma nativa **dentro de AGENDAM**, sin depender de abrir Google Calendar. La sincronización con Google Calendar (sección 3.7) es un canal adicional, no un sustituto. | Recepción, Médico | Esencial |
| RF-029b | El sistema debe permitir configurar el horario laboral del médico con patrones distintos por grupo de días (ejemplo real: Lun/Mié/Vie 11:00-14:00 y 17:00-20:40; Mar/Jue/Sáb 11:00-14:00 y 17:00-19:00). | Admin, Médico | Esencial |

### 3.4 Módulo — Turnos y sala de espera (Fase 2)

| ID | Requisito | Actor | Prioridad |
|---|---|---|---|
| RF-030 a RF-034 | *(sin cambios respecto a v0.1)* | | |
| RF-035 | **Regla de orden de la cola**: los pacientes pasan por orden de llegada y de hora de cita. Si dos citas coinciden en la misma hora, uno de los pacientes queda en espera detrás del otro (orden de llegada física desempata). | Sistema | Esencial |
| RF-035a | Las "aplicaciones" (sin cita) pueden insertarse entre consultas ya en curso, **siempre y cuando ningún paciente agendado lleve más de 30 minutos esperando su consulta**. Si algún paciente agendado supera los 30 minutos de espera, ninguna aplicación puede adelantarlo. | Sistema | Esencial |
| RF-036 | *(sin cambios respecto a v0.1)* | | |
| RF-037 | *(sin cambios — Futuro, Fase 6)* | | |
| RF-038 | Al finalizar una consulta, el médico debe poder registrar el **monto a cobrar**. | Médico | Esencial |
| RF-038a | Recepción debe poder ver el monto a cobrar de una consulta ya finalizada, sin necesidad de preguntar directamente al médico. | Recepción | Esencial |

> Nota: el monto a cobrar es un dato administrativo — visible para recepción — y debe mantenerse separado del diagnóstico y las notas clínicas (que recepción no debe ver, ver sección 5 de permisos).

| RF-035b | Si un paciente llega **sin cita solicitando consulta regular** (no aplicación): el sistema debe permitir a recepción asignarle un turno el mismo día si el día no está saturado, los pacientes en espera no llevan mucho tiempo esperando, y el médico no va retrasado. En caso contrario, debe ofrecerse un lugar en el **siguiente turno** (matutino/vespertino) disponible, o agregarlo a la lista de espera si tampoco hay cupo ahí. | Recepción | Esencial |
| RF-035c | El sistema debe soportar una **lista de espera** de pacientes con consultas cortas conocidas, que el médico puede atender entre pacientes agendados cuando el tiempo lo permite (distinto del flujo de "aplicaciones"). | Recepción, Médico | Esencial |
| RF-035d | El sistema debe registrar cancelaciones e inasistencias (mínimo ~1 al día es la frecuencia real) para poder ofrecer automáticamente ese lugar liberado a alguien de la lista de espera. | Sistema | Importante |
| RF-035e | Cuando exista más de un médico activo, la selección del médico al agendar o registrar un turno debe requerir el mínimo de pasos posible (ej. recordar el último médico usado, o selector de un solo clic) — no debe volverse un cuello de botella operativo al crecer el consultorio. | Recepción | Importante |

### 3.5 Módulo — Confirmaciones por WhatsApp (Fase 3)

| ID | Requisito | Actor | Prioridad |
|---|---|---|---|
| RF-040 | El sistema debe enviar un mensaje de WhatsApp con plantilla fija: *"Hola, hablamos de [consultorio] para confirmar y recordarle su cita del día [fecha] a las [hora]. Responda: confirmo / cancelo / cambiar de horario."* | Sistema | Esencial |
| RF-040a | El momento de envío depende del turno de la cita: la tarde-noche anterior si la cita es matutina, o la mañana del mismo día si la cita es vespertina (ver sección 2, paso 4). | Sistema | Esencial |
| RF-041 | El sistema debe usar un **clasificador de intención basado en IA (modelo de lenguaje)** para interpretar la respuesta del paciente en lenguaje natural — no solo coincidencia exacta de palabras — y mapearla a una de: `confirmar`, `cancelar`, `cambiar_horario`, `no_entendido`. | Sistema | Esencial |
| RF-041a | Si la intención detectada es `confirmar` o `cancelar`, el sistema actúa automáticamente y actualiza el estado de la cita. | Sistema | Esencial |
| RF-041b | Si la intención es `cambiar_horario` o `no_entendido`, el sistema debe: (1) marcar esa conversación como **"pendiente de atención humana"**, (2) enviar una alerta a recepción, y (3) **pausar las respuestas automáticas de la IA en esa conversación** durante una ventana de tiempo configurable (o hasta que recepción la marque como resuelta) — así se evita que la IA y recepción respondan al mismo paciente al mismo tiempo. | Sistema | Esencial |
| RF-041c | Durante la atención humana, recepción responde **directamente desde la app normal de WhatsApp Business** en el mismo número — no se requiere que use una interfaz especial dentro de AGENDAM. Depende de que la coexistencia de número esté disponible (ver advertencia técnica abajo). | Recepción | Esencial |
| RF-041d | El sistema debe registrar en la bitácora de auditoría (RF-080) cuándo una conversación pasa a atención humana y cuándo la IA retoma el control. | Sistema | Importante |
| RF-041e | La IA debe limitarse estrictamente a temas administrativos de la cita (confirmar, cancelar, detectar solicitud de cambio de horario). **Nunca debe responder preguntas clínicas ni dar información médica** — cualquier mensaje que se salga de lo administrativo se clasifica como `no_entendido` y se escala a recepción. | Sistema | Esencial |
| RF-042 a RF-044 | *(sin cambios respecto a v0.1)* | | |
| RF-045 | El sistema debe usar el **mismo número de WhatsApp Business que ya opera la farmacia** (no un número nuevo). | Sistema | Esencial |

> ⚠️ **Advertencia técnica a verificar antes de implementar**: la API oficial de WhatsApp Business (necesaria para automatizar envíos, vía Twilio u otro proveedor) tradicionalmente requiere "migrar" el número, lo que puede impedir seguir usando la app normal de WhatsApp Business en ese mismo número al mismo tiempo — salvo que se use la función de **coexistencia** que Meta ha ido habilitando (permite usar la app y la API en paralelo sobre el mismo número, con algunas limitaciones). Antes de la Fase 3 hay que confirmar con el proveedor (Twilio u otro) si la coexistencia está disponible para este número; si no lo está, la alternativa es usar un número secundario solo para los mensajes automatizados, mientras el número actual sigue como canal humano de recepción. **Esta verificación se vuelve todavía más importante ahora**, porque el diseño híbrido (RF-041b, RF-041c) depende de que recepción pueda responder desde la misma app de WhatsApp Business sin conflicto con la IA.

### 3.6 Módulo — Consulta médica y expediente clínico (Fase 4)

| ID | Requisito | Actor | Prioridad |
|---|---|---|---|
| RF-050 a RF-054 | *(sin cambios respecto a v0.1)* | | |
| RF-055 | El expediente debe integrar, como mínimo, lo exigido por la NOM-004-SSA3-2012: ficha de identificación, antecedentes personales y familiares, padecimiento actual, exploración física (signos vitales: temperatura, tensión arterial, frecuencia cardiaca y respiratoria, peso y talla), diagnóstico, pronóstico e indicación terapéutica, notas de evolución por cada consulta, y datos del establecimiento. | Médico | Esencial |
| RF-056 | *(sin cambios respecto a v0.1)* | | |
| RF-057 | El sistema debe permitir generar e imprimir la receta replicando el formato que ya usa la farmacia hoy en papel (incluye cédula profesional, nombre del médico, universidad, y demás datos que ya contiene ese formato). | Médico | Futuro *(Fase 7)* |
| RF-058 | El sistema debe permitir un catálogo de medicamentos con al menos: componente/nombre genérico, nombre comercial, y concentración (mg), para agilizar la captura de tratamiento durante la consulta (autocompletado). | Médico | Importante |
| RF-059 | El sistema debe permitir **importar el catálogo de medicamentos desde un archivo CSV**. | Admin | Importante |
| RF-060f | *(Futuro)* El sistema podría registrar qué medicamentos recetados requieren surtirse en la farmacia, para apoyar el reabastecimiento — no existe esta relación hoy, pero se identificó como valiosa. No forma parte del MVP ni implica un sistema de inventario completo. | — | Futuro |

> Contexto relevante: hoy el médico solo lleva un registro más completo de sus pacientes de seguimiento; para el resto, la única constancia que existe es la receta física entregada al paciente. AGENDAM representa una mejora real sobre este punto, ya que el MVP (RF-050 a RF-056) captura expediente para **todos** los pacientes atendidos, no solo los de seguimiento.

### 3.7 Módulo — Google Calendar (Fase 5)

| ID | Requisito | Actor | Prioridad |
|---|---|---|---|
| RF-065 | El sistema debe sincronizar (de forma unidireccional, AGENDAM → Google Calendar) los horarios ocupados de cada médico. | Sistema | Importante |
| RF-066 | El propósito es que el personal de la farmacia pueda consultar la disponibilidad directamente desde la aplicación de Google Calendar, sin necesariamente abrir AGENDAM. No se requiere edición bidireccional en el MVP. | Recepción | Importante |

### 3.8 Módulo — Comunicación interna (Fase 5)
*(sin cambios respecto a v0.1: RF-060)*

### 3.9 Módulo — Auditoría y trazabilidad (Fase 0, transversal)

| ID | Requisito | Actor | Prioridad |
|---|---|---|---|
| RF-080 | El sistema debe registrar en una bitácora de auditoría: inicios de sesión, creación/reprogramación/cancelación de citas, cambios de estado de turno, y creación/edición de notas clínicas (diagnóstico, tratamiento, receta). | Sistema | Esencial |
| RF-081 | Cada registro de auditoría debe incluir: usuario responsable, acción realizada, fecha/hora, y referencia al registro afectado. | Sistema | Esencial |
| RF-082 | El Administrador debe poder consultar la bitácora completa de auditoría. | Admin | Esencial |
| RF-083 | Cada médico debe poder consultar únicamente su propia actividad registrada en la bitácora. | Médico | Esencial |

### 3.10 Módulo — Administración (transversal)
*(sin cambios respecto a v0.1: RF-070, RF-071)*

---

## 4. Requisitos no funcionales

*(RNF-01 a RNF-08 sin cambios respecto a v0.1, con las siguientes precisiones:)*

| ID | Requisito |
|---|---|
| RNF-03a | El expediente clínico y la bitácora de auditoría deben conservarse un mínimo de **5 años** a partir de la última atención/registro, conforme al numeral 5.4 de la NOM-004-SSA3-2012. |
| RNF-06 | *(actualizado)* Cada consultorio opera sobre su **propia base de datos** (ver Documento 03 v0.2, sección 3); la misma base de código sirve a todos los consultorios. |
| RNF-09 | El aprovisionamiento de un consultorio nuevo puede realizarse de forma manual (baja frecuencia esperada); no se requiere automatizarlo en el MVP. |

---

## 5. Reglas de permisos por rol (definidas)

| Información | Médico | Recepción | Administrador |
|---|---|---|---|
| Datos administrativos del paciente (nombre, teléfono, citas, turno, monto a cobrar) | ✅ | ✅ | ✅ |
| Historial clínico completo (diagnóstico, tratamiento, notas) | ✅ — de cualquier paciente del consultorio, no solo los propios (continuidad de atención entre médicos del mismo consultorio) | ❌ | ❌ por defecto *(el Administrador gestiona configuración, no requiere ver clínica salvo necesidad justificada)* |
| Monto a cobrar por consulta | ✅ (lo registra) | ✅ (lo consulta) | ✅ |
| Configuración de usuarios y catálogos | ❌ | ❌ | ✅ |
| Turnos y sala de espera | ✅ | ✅ | ✅ |
| Bitácora de auditoría | ✅ (solo la propia) | ❌ | ✅ (completa) |

**Justificación**: se sigue el principio de mínimo acceso necesario (RNF-01) — recepción y administración no necesitan ver diagnósticos ni notas clínicas para cumplir su función, mientras que los médicos sí requieren visibilidad completa entre ellos por tratarse del mismo consultorio y para dar continuidad al paciente.

---

## 6. Diccionario de datos (actualizaciones)

### 6.3a TipoConsulta (catálogo)
| Campo | Tipo | Notas |
|---|---|---|
| id | identificador único | |
| nombre | texto | Consulta general / Consulta pediátrica / Procedimiento médico / Aplicación |
| duracion_min | número | 5, 20, 40 o 60 según el tipo |
| requiere_agenda | booleano | falso solo para "Aplicación" |

### 6.4 Cita (actualización)
Se agrega:
| Campo | Tipo | Notas |
|---|---|---|
| tipo_consulta_id | referencia a TipoConsulta | |

### 6.5 Turno (actualización)
Se agrega:
| Campo | Tipo | Notas |
|---|---|---|
| tipo | enum: cita_agendada / aplicacion | |
| hora_inicio_espera | hora | usada para calcular la regla de los 30 minutos (RF-035a) |

### 6.6 Consulta (actualización)
Se agrega:
| Campo | Tipo | Notas |
|---|---|---|
| monto_a_cobrar | número | visible para recepción (RF-038a), separado del contenido clínico |
| ficha_identificacion, antecedentes, padecimiento_actual | texto/estructura | campos mínimos NOM-004 (RF-055) |

### 6.7a CatalogoMedicamento (nueva entidad)
| Campo | Tipo | Notas |
|---|---|---|
| id | identificador único | |
| componente | texto | nombre genérico |
| nombre_comercial | texto | |
| concentracion_mg | texto/número | |

### 6.5a ListaEspera (nueva entidad, distinta de Turno)
| Campo | Tipo | Notas |
|---|---|---|
| id | identificador único | |
| paciente_id | referencia a Paciente | |
| motivo | texto | consulta corta conocida |
| fecha_registro | fecha/hora | |
| estatus | enum: en_espera / asignada / cancelada | |

### 6.7b ConversacionWhatsApp (nueva entidad)
| Campo | Tipo | Notas |
|---|---|---|
| id | identificador único | |
| cita_id | referencia a Cita | |
| paciente_id | referencia a Paciente | |
| estatus | enum: ia_activa / pendiente_humano / atendida_humano | controla si la IA responde o está en pausa |
| pausa_hasta | fecha/hora, opcional | ventana de silencio de la IA tras escalar a humano |

### 6.8 BitacoraAuditoria (nueva entidad)
| Campo | Tipo | Notas |
|---|---|---|
| id | identificador único | |
| usuario_id | referencia a Usuario | |
| accion | texto/enum | login, cita_creada, cita_cancelada, turno_actualizado, nota_clinica_creada, etc. |
| entidad_afectada | texto | tabla/registro relacionado |
| fecha_hora | fecha/hora | |

---

## 7. Puntos abiertos restantes

- **Catálogo de medicamentos**: la estructura ya quedó definida (RF-058, RF-059: componente, nombre comercial, mg, vía CSV). Solo falta decidir la fuente inicial del CSV — armarlo ustedes mismos con lo que el doctor usa más seguido (recomendado para arrancar rápido) o buscar una base pública ya existente. No bloquea el desarrollo.
- **Coexistencia de WhatsApp Business**: verificar con el proveedor elegido (Twilio u otro) antes de la Fase 3 — ver advertencia técnica en sección 3.5.

## 8. Nota operativa — capacidad física

La sala de espera tiene capacidad para ~6 personas; los pacientes casi nunca llegan solos. Esto no genera un requisito de software adicional, pero es útil como referencia para dimensionar la futura pantalla pública (Fase 6).

## 9. Siguiente paso

Con esta versión, el SRS ya no tiene bloqueos para iniciar las Fases 0 a 5 en Claude Code. Los dos puntos abiertos (fuente del catálogo de medicamentos, coexistencia de WhatsApp) no bloquean el desarrollo — se resuelven antes de las fases donde realmente aplican (Fase 4 y Fase 3, respectivamente).
