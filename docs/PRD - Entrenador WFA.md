# PRD — Entrenador WFA (Primeros Socorros en Lugares Remotos)

> Documento de requerimientos para **handoff a Claude Code**. Define el producto, los 3 módulos, la pedagogía (que es un requerimiento, no decoración) y el contexto técnico. El contenido clínico vive en los `.yaml`; este PRD es el "qué" y el "por qué".

**Archivos del paquete**
- `PRD - Entrenador WFA.md` ← este documento (empezar acá)
- `Motor de Escenarios - Diseño.md` ← diseño y lógica del Módulo 3 (motor de escenarios)
- `contenido-cav.yaml` ← fuente de verdad: siglas, cadena, signos vitales, evacuación, mazo de tarjetas
- `casos.yaml` ← los 2 casos de escenarios, listos para cargar

---

## 1. Visión y objetivo

Una herramienta interactiva, **basada en evidencia pedagógica**, para **aprender y agilizar la actuación** en primeros socorros en lugares remotos, centrada en la **Cadena de Atención a la Víctima (CAV)**. No busca cubrir todo el manual: busca que el usuario **actúe rápido y bien** en lo que importa.

**Métrica de éxito (informal):** que el usuario, tras uso recurrente, ejecute el HABCDE en orden sin dudar, recuerde las siglas, y tome buenas decisiones de evacuación en escenarios realistas.

## 2. Usuarios y contexto de uso

- **Quién:** el autor (Lucas) y compañeros de un **curso integral de montañismo**.
- **Dónde:** estudio en casa (móvil/escritorio) y repaso en el campo. **Debe funcionar offline** (en montaña no hay señal).
- **Ambientación:** montañismo real (aproximación, cumbre, descenso, vivac, altitud), no genérica.
- **Tono:** exigente (ver §4, "tono del feedback").

## 3. Los 3 módulos (resumen)

1. **Aprender** — presentar la CAV de forma clara y memorable. Es la *fuente de verdad* del resto.
2. **Practicar lo teórico** — memorizar siglas, orden y framework con **recuperación generativa + repetición espaciada + feedback que reusa el Módulo 1**.
3. **Escenarios ("actuar")** — casos integrales tipo "te encuentras con…" con **banco de acciones** (no MCQ obvio), que evalúan toda la cadena. Diseño completo en `Motor de Escenarios - Diseño.md`.

Los tres se conectan: el Módulo 1 da el `racional` que los módulos 2 y 3 muestran como feedback; los errores en escenarios pueden alimentar el repaso del Módulo 2.

## 4. Principios pedagógicos (requerimientos, con evidencia)

Estos principios **deben** reflejarse en la implementación:

- **Práctica de recuperación + espaciado + intercalado.** Recordar activamente, repartido en el tiempo y mezclando temas, supera a releer. → Módulo 2 con SRS e interleaving. ([retrieval/spacing](https://www.jacr.org/article/S1546-1440(23)00646-4/pdf))
- **Efecto de generación.** Se recuerda mejor lo que se **produce** que lo que se **reconoce**. → en Módulo 2, formatos *ordenar/escribir/cloze*, no multiple-choice por defecto. ([generation effect](https://www.sciencedirect.com/science/article/abs/pii/S0749596X09001156))
- **Distractores de calidad (key features).** En escenarios, los distractores son **discriminaciones reales** (prioridad/contexto/misconcepción/variante), nunca errores absurdos. ([key-feature questions](https://asmepublications.onlinelibrary.wiley.com/doi/10.1111/medu.12509))
- **Práctica deliberada + automatismo bajo estrés.** Lo no automatizado se cae bajo estrés. → drill del HABCDE, repetición con feedback inmediato. ([deliberate practice / sim](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6334393/))
- **Carga cognitiva.** Segmentar, una idea por pantalla, andamiaje que se retira. → Módulo 1 chunked; dificultad creciente.
- **Feedback elaborativo.** El feedback que **explica** supera al que solo corrige; mostrarlo en aciertos también. → reusar `racional` del Módulo 1.
- **El olvido es rápido en primeros auxilios.** Diseñar para **uso recurrente y sesiones cortas** (no una sola sentada). ([skill decay](https://www.protrainings.com/research/8-cpr-skill-deterioration-first-year))
- **Tono del feedback: "Debriefing with Good Judgment"** — **alta exigencia + alta consideración**. Directo, sin maquillar el error (acá un error puede matar), con estructura *observación → implicación → estándar y porqué*; exigente en la vara, nunca en el desprecio. ([debriefing](https://advancesinsimulation.biomedcentral.com/articles/10.1186/s41077-022-00235-y))

## 5. Contexto técnico (recomendaciones; la decisión final es de Claude Code)

- **Offline-first / PWA recomendado.** Uso en montaña sin señal → instalable, con service worker y caché de assets. Cross-device (móvil + escritorio). Compartible por link.
- **Sin backend, sin cuentas, sin LLM** en la v1. Todo local (localStorage o IndexedDB para el estado SRS, racha, progreso).
- **Contenido como datos.** La UI lee de `contenido-cav.yaml` y `casos.yaml` (o sus equivalentes JSON). **No hardcodear** contenido clínico; así se extiende agregando datos.
- **Stack sugerido (a criterio de Claude Code):** React + Vite + service worker, o SvelteKit, o incluso vanilla. Requisitos que el stack debe cumplir: offline, contenido-como-datos, deploy estático simple, buen rendimiento en móvil.
- **UX:** móvil primero, objetivos táctiles grandes, contraste legible, uso con una mano. Español (rioplatense OK).
- **Persistencia robusta:** envolver el storage con try/catch y fallback en memoria (que no se rompa si el storage no está disponible).

## 6. Módulo 1 — APRENDER  *(requerimiento nuevo)*

**Objetivo:** presentar la CAV de forma clara, fácil de seguir y memorable; ser la fuente de verdad del resto.

**Requerimientos funcionales**
- **R1.1 — Organizador previo.** Mostrar primero el **mapa de la cadena** (escena → primaria HABCDE → secundaria → evacuación) como vista de entrada navegable, para que cada detalle tenga dónde colgarse.
- **R1.2 — Nodos expandibles.** Cada paso/nodo se expande a sus ítems (p. ej. HABCDE: cada letra con *significado* + *detalle* + *por qué*). Datos desde `siglas` y `cadena`.
- **R1.3 — Racional canónico reutilizable.** Cada concepto tiene un `racional` corto identificado por `id`, que los módulos 2 y 3 muestran como feedback (misma fuente, sin duplicar texto).
- **R1.4 — Doble codificación.** Texto + un ícono/visual simple por paso (mínimo viable: íconos; ilustraciones, fase 2).
- **R1.5 — Segmentación.** Secciones cortas, una idea por pantalla (controlar carga cognitiva).
- **R1.6 — Ejemplo resuelto.** Un "caso resuelto" narrado que muestre una pasada limpia por la cadena (worked example).
- **R1.7 — Referencia rápida.** Modo "ver todo" compacto (siglas + signos vitales normales + niveles de evacuación) para consulta veloz.

**Datos que consume:** `siglas`, `cadena`, `signos_vitales`, `niveles_evacuacion` de `contenido-cav.yaml`.
**Pedagogía:** organizador previo, chunking, doble codificación, worked example, segmentación.
**No-objetivos:** sin lo legal/ético; sin cubrir los 15 capítulos del manual (solo el núcleo CAV).

## 7. Módulo 2 — PRACTICAR LO TEÓRICO  *(requerimiento nuevo)*

**Objetivo:** memorizar y consolidar siglas, orden de pasos y framework, con recuperación generativa y repaso espaciado.

**Requerimientos funcionales**
- **R2.1 — Recuperación generativa (no MCQ por defecto).** Formatos:
  - `ordenar` — arrastrar/tocar para secuenciar (p. ej. HABCDE, AVDN, SOAP).
  - `escribir` — respuesta tipeada; **normalizar** (minúsculas, sin tildes) y aceptar la lista de palabras clave del campo `respuesta`.
  - `cloze` — completar huecos.
  - `elegir` — **solo** cuando generar no aplica, y con **≥5 distractores** plausibles.
- **R2.2 — Repetición espaciada.** SRS tipo Leitner (cajas con intervalos crecientes) + due dates; **intercalar** temas (no bloquear por sigla).
- **R2.3 — Feedback elaborativo.** Tras cada respuesta (también en aciertos) mostrar el `racional` del concepto referido por `racional_ref`. Enlace directo a su tarjeta del Módulo 1.
- **R2.4 — Persistencia offline** del estado SRS, racha y progreso.
- **R2.5 — Gancho de refuerzo.** Las tarjetas falladas suben de frecuencia; (opcional v1.1) los conceptos fallados en escenarios entran a la cola de repaso.
- **R2.6 — Gamificación ligera.** Racha de días y "dominio por tema".
- **R2.7 — Mazo desde datos.** Las tarjetas vienen de `tarjetas` en `contenido-cav.yaml` (se pueden auto-generar más por letra desde `siglas`).

**Datos que consume:** `tarjetas` (+ `siglas`/`signos_vitales`/`niveles_evacuacion` para el feedback).
**Pedagogía:** efecto de generación, testing effect, espaciado, intercalado, feedback elaborativo.
**No-objetivos:** sin MCQ "fácil" como formato principal; sin grading por LLM.

## 8. Módulo 3 — ESCENARIOS ("actuar")  *(ya especificado)*

Diseño completo en **`Motor de Escenarios - Diseño.md`**; casos en **`casos.yaml`**. Requerimientos firmes:

- **R3.1 — Un caso, tres modos** desde los mismos datos: **banco de acciones** (B, prioritario para v1), **recordar-primero** (A) y **detectar-el-error** (C).
- **R3.2 — Banco de acciones.** Por fase, mezclar `acciones_clave` + `distractores` (~25 ítems); el jugador elige **qué** y en **qué orden**. Sin pistas obvias.
- **R3.3 — Orden estricto** en la fase `primaria` (HABCDE), según el campo `orden`. Saltear "H" con hemorragia masiva = fallo crítico.
- **R3.4 — Divulgación progresiva.** Aplicar `revelaciones`: el estado cambia según las acciones (p. ej. al exponer aparece el shock; en hipotermia, deja de tiritar = empeora).
- **R3.5 — Scoring por key features**, no por % de clicks: críticas hechas/omitidas, orden, distractores activados (con su `por_que_no`), ineficiencias (penalización mínima).
- **R3.6 — Debrief** al final de cada caso: ✅ hiciste / ⚠️ te faltó / ❌ peligroso / 🧭 prioridades / decisión de evacuación; cada ítem enlaza al `racional`. Tono según §4.
- **R3.7 — Autocalificación por honestidad** en el modo A (sin fricción).
- **R3.8 — Sin reintentos** dentro de una corrida puntuada; re-jugar el caso de cero. Tiempo solo en la fase primaria.

**Datos que consume:** `casos.yaml` (+ `racional` de `contenido-cav.yaml` para el feedback).

## 9. Conexión entre módulos y modelo de datos

- **Fuente de verdad única:** `contenido-cav.yaml`. Módulos 2 y 3 referencian conceptos por `id` (`racional_ref` / `concepto`) para el feedback. **No duplicar textos de racional en la UI.**
- **Estado local del usuario** (no en los archivos de contenido): SRS por tarjeta, racha, casos completados, mejores tiempos. Persistir local.
- Al implementar, **construir primero el cargador de contenido** (parse YAML/JSON → modelos en memoria) y un pequeño "design system" compartido (colores, tarjetas, botones, niveles CRÍTICO/GRAVE/LEVE = rojo/ámbar/verde).

## 10. No-objetivos (v1)

- Sin módulo legal/ético.
- Sin cubrir los 15 capítulos del manual (solo núcleo CAV; hipotermia entra como caso ambiental).
- Sin LLM, sin backend, sin cuentas de usuario, sin multijugador.
- Sin grading de texto libre por LLM (diferido a un "modo pro" posterior, contra rúbrica fija).

## 11. Fases de build sugeridas

0. **Andamiaje:** scaffolding, cargador de contenido (YAML/JSON), design system, PWA básica.
1. **Módulo 1 (Aprender):** es la fuente de verdad; habilita el feedback del resto.
2. **Módulo 2 (Practicar):** SRS + formatos generativos + feedback elaborativo.
3. **Módulo 3 (Escenarios):** motor + 2 casos; primero el modo **banco de acciones**, luego recordar-primero y detectar-error.
4. **Progreso + gamificación + pulido offline** (racha, dominio por tema, instalable).

## 12. Notas para el handoff a Claude Code

- Leé este PRD y `Motor de Escenarios - Diseño.md` antes de codear. Tratá los `.yaml` como **contrato de contenido**.
- **Fidelidad clínica:** no inventes pasos. El contenido se edita en los `.yaml` y se revisa contra el manual AIDER. Si algo no está en los datos, preguntá antes de inventar.
- **La pedagogía es requerimiento:** implementá recuperación generativa, espaciado, feedback elaborativo, scoring por key features y el tono del debrief. No los recortes por simplicidad.
- Empezá por el cargador de contenido + Módulo 1; validá que el feedback de los módulos 2 y 3 lea el mismo `racional`.
- Convertí los YAML a JSON si te resulta más cómodo en build; mantené una sola fuente.
