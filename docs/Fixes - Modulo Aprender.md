# Fixes — Módulo Aprender

> Notas para implementar en Claude Code, priorizadas. El **contenido** ya está en `docs/contenido-cav.yaml` (v0.3); lo que sigue son cambios de **render/UI**. Tras tocar contenido: `npm run content:build`. No hardcodear contenido en componentes.

## P1 · Mostrar el ORDEN de la fase Escena (1–4 + buscar ayuda)
- **Qué:** la Escena es una **secuencia**, no un menú. Numerar **1 Seguridad → 2 Mecanismo de daño → 3 Número de víctimas → 4 Impresión general**, y **Buscar ayuda** como paso puente al final. **Bioseguridad** es sub-parte de Seguridad (1), no un 5.º ítem suelto.
- **Por qué:** el manual dice que la evaluación de la escena *"consta de 4 partes"* en ese orden y que *"la seguridad es siempre la prioridad"*. Hoy se ven como tarjetas iguales sin orden → no se percibe ni la secuencia ni la prioridad (brecha diseño↔pedagogía).
- **Datos (ya en el YAML v0.3):** `cadena[escena].orden_estricto: true`, `cadena[escena].secuencia` (con `orden`, `parte`, `prioridad`, `incluye: [bioseguridad]`) y `cadena[escena].luego: buscar_ayuda`.
- **Dónde:** `src/modules/learn/domain/chainModel.ts` → `SCENE_TOPICS`: leer el orden desde `content.scene.secuencia` (en vez de un array hardcodeado) y pasar un `index` al nodo. Reusar un **badge numérico** (mismo patrón que el badge de letra del HABCDE) en `NodeCard`/`PhaseTimeline`. Señalar Seguridad como prioridad (p. ej. "1 · prioridad").

## P2 · Nodo "Signos vitales": mostrar los valores
- **Qué:** hoy lista los 7 componentes **sin valores**, y las filas **parecen tocables** pero no expanden. Mostrar inline: FR 12-20, FC 60-100, PA 120/80, relleno <2 s, reevaluación (estable 15-20 / inestable 5 min). (Ya aparecen en "Ver todo".)
- **Por qué:** es el dato más útil para "actuar rápido"; y filas con aspecto interactivo que no responden rompen la afordancia.
- **Dónde:** `chainModel.ts` (~línea 90) — hoy `items: (content.vitalSigns.components ?? []).map(c => ({ label: c, detail: '' }))`. Mapear los sub-objetos de `content.vitalSigns` (los mismos que usa `QuickRef.tsx`) al `detail` de cada ítem.

## P3 · Reglas prácticas (están en los datos, no se muestran)
- **Qué:** `practicalRules` existe en el JSON pero **ningún componente la consume**. Son micro-decisiones críticas: frente-mentón vs. subluxación, hemorragia→torniquete (5-8 cm, anotar hora), "si habla, tiene vía aérea", PLS, signos de shock, nada por boca.
- **Dónde:** colgar cada regla del **nodo de letra HABCDE** que corresponde (A → maniobras de vía aérea; H → torniquete; C → shock) usando el `concepto` de cada regla, o una sección "Reglas clave" en el detalle.

## P4 · Posición de la víctima (en datos, sin render)
- **Qué:** `posicion_victima` (confortable / PLS / boca arriba) está en el YAML, sin mostrarse. Sumar al nodo de **evacuación** o a uno de la secundaria.

## P5 · Pulidos de diseño (de la crítica)
- **Un solo lenguaje de orden:** números para las fases-secuencia (escena); la primaria conserva las **letras** (son la mnemotecnia). Que ninguna fase ordenada quede visualmente desordenada.
- **Íconos:** diferenciar **Seguridad** vs **Impresión general** (hoy dos triángulos casi iguales; usar p. ej. un escudo para Seguridad).
- **Contraste:** oscurecer las etiquetas en oliva ("EN LÍNEA", "FASE 0") y el subtítulo en itálica (apuntar a ≥4.5:1).
- **Touch targets:** agrandar los links "← Anterior / Siguiente →".

## Qué está bien (no tocar)
Mapa de la cadena como organizador previo · una idea por pantalla + "POR QUÉ" · badges de letra del HABCDE · caso resuelto · referencia rápida · paleta calma · contenido-como-datos. Todo eso acompaña bien la pedagogía.
