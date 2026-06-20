# Fixes 2 — Módulo Aprender (ronda 2)

> Segunda ronda, surgida de la revisión cruzada (Lucas + Claude) contra el PDF y la UI. La ronda 1 (orden de escena, posición, etc.) ya está implementada. Acá va lo nuevo. El **contenido** ya está actualizado en `docs/contenido-cav.yaml` (**v0.4**); marco qué es "datos listos, cablear" vs "UI nueva". Tras tocar contenido: `npm run content:build`.

## P1 · Mostrar el bloque PREVIO de la primaria (rama de seguridad)
- **Qué:** antes del HABCDE, mostrar el paso previo: **"Si NO responde y NO respira → secuencia de paro (RCP/DEA)"** y **"Si está consciente → presentarse, pedir consentimiento, contacto visual"**.
- **Por qué:** no es un detalle, es una **bifurcación de seguridad**: si no respira, NO se entra al HABCDE, se va a RCP. Hoy está en los datos pero no se ve.
- **Datos (ya en el YAML):** `cadena[primaria].contenido.previo` y `cadena[primaria].contenido.presentacion`.
- **Dónde:** `chainModel.ts` → `primaryNodes()` hoy solo arma nodos de letra. Agregar una **tarjeta/encabezado de fase** (o un primer nodo "Antes de empezar") que lea `previo` y `presentacion`. Idealmente visible al entrar a la fase Primaria, no escondido.

## P2 · "Fase 0" → "Eslabón 1" (numerar desde 1)
- **Qué:** las fases se muestran 0-indexadas ("Fase 0"). Para alumnos nuevos, numerar desde 1. Sugerencia: **"Eslabón 1"** (encaja con la metáfora de *Cadena*), o "Fase 1".
- **Dónde:** `src/modules/learn/ui/PhaseTimeline.tsx:11` → `Fase {index}` usa el índice crudo. Cambiar a `Eslabón {index + 1}` (o "Fase {index + 1}").

## P3 · Racional específico por letra del HABCDE
- **Qué:** hoy el "POR QUÉ" de cada letra repite el **racional general** del HABCDE. Mostrar uno **propio por letra** — el *por qué en ese orden/momento*, no lo que ya dice el detalle.
- **Datos (ya en el YAML v0.4):** cada `siglas[habcde].letras[].porque` (p. ej. H: *"Una hemorragia masiva mata en minutos, antes que cualquier otra cosa: por eso va primero."*).
- **Cablear (3 toques):**
  1. `src/shared/content/mapping.ts` (~línea 24): en el map de `letters`, agregar `porque: l.porque`.
  2. `src/shared/content/schemas.ts` (`AcronymLetterSchema`): agregar `porque: z.string().optional()`.
  3. `chainModel.ts` → `primaryNodes()`: usar `letra.porque` como racional del nodo (en vez de `rationaleId: habcde.id`), y renderizarlo en el "POR QUÉ" de `NodeDetail`.

## P4 · TEV y "buscar ayuda" ampliados *(contenido ya actualizado — fluye solo)*
- **TEV:** los 3 componentes ahora traen señales observables (respiración: trípode, tiraje, ronquido/silbido/burbujeo; circulación: pálida/sudorosa/cianótica; **sistema neurológico**: flacidez, agitación, mirada perdida…). Útil en montaña. Verificar que el nodo "Impresión general" muestre estos `componentes` (no solo el nombre).
- **Buscar ayuda:** ahora distingue **(1) buscar ayuda → (2) llamar SEM → (3) ayuda externa (AE) en remoto**. *Opcional UI:* renderizarlo como 3 sub-puntos en vez de un párrafo.
- **Acción:** `npm run content:build` y listo; sin cambios de schema.

## P5 · Micro-recuperación DENTRO de learn (feature nueva)
- **Qué:** sumar recuperación activa liviana en learn, antes de mandar a Practicar. Ideas:
  - **"Recordá antes de abrir":** en cada nodo, ocultar la respuesta y mostrar primero un "¿qué era esto?" con tap-to-reveal.
  - **"Chequeo de 30 s"** al cerrar Escena: ordenar las 4 partes.
  - **"¿Cuál es el próximo paso?"** después de H, A y B: recordar la siguiente letra, con feedback inmediato.
- **Por qué:** *pretesting / efecto de generación* — intentar recordar (aun fallando) antes de ver la respuesta mejora la codificación. Evidencia sólida.
- **⚠️ Frontera entre módulos (clave para no duplicar):**
  - **Learn** = recuperación **efímera y sin puntaje** (un "recordá y revelá"). **NO** persistir estado ni agendar.
  - **Practicar** = repetición espaciada **con scoring y agenda** — única fuente de verdad del dominio. No construir un segundo SRS en learn.
  - **Escenarios** = decisión bajo contexto rico ("dada ESTA escena, ¿qué hacés?"). En learn, el "¿qué harías?" se limita a **recordar el paso del framework**, no a juicio situacional.

## P6 · Caso resuelto mejorado
- **Qué:** hoy salta de "escena asegurada + guantes" (una línea) directo a H. Sumar:
  - La **escena completa** (las 4 partes) como primer beat, antes de H.
  - Una **pausa interactiva**: *"¿Qué observarías antes de tocar?"* (auto-explicación) antes de revelar.
- **Por qué:** worked example + self-explanation; modela mejor la cadena entera y obliga a anticipar.

## Prioridad sugerida
1. **P1** (bloque previo — seguridad) · 2. **P2** (Eslabón, trivial) · 3. **P3** (racional por letra) · 4. **P5** (micro-recuperación, respetando la frontera) · 5. **P6** (caso resuelto) · 6. **P4** (ya fluye con el build).
