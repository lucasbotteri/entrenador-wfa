# Fixes 3 — Módulo Aprender (ronda 3)

> Tercera ronda: nodos de la fase **Escena** que estaban **subrepresentados vs. el PDF** (el contenido los compactaba de más). Surgió al revisar "Número de víctimas". El contenido ya está actualizado en `docs/contenido-cav.yaml` (**v0.6**); acá va el cableo de UI. Tras tocar contenido: `npm run content:build`.

## P1 · Nodo "Número de víctimas" → es víctimas ↔ recursos
- **Qué:** el manual no limita esta parte a contar víctimas. Es un balance **víctimas ↔ recursos**: cuántas víctimas (buscar más), los **recursos materiales y humanos** con los que contás (en remoto, limitados), **triage** si las víctimas exceden a los socorristas, y los **testigos** presentes como recurso (información + ayuda).
- **Datos (ya en el YAML v0.6):** `numero_victimas` ahora tiene `recursos` y `testigos` (además de `definicion`/`triage`/`nota`).
- **Dónde:** `chainModel.ts` → SCENE_TOPICS `numero_victimas.fields`: agregar `['recursos','Recursos']` y `['testigos','Testigos / ayuda']`. Opcional: título → "Número de víctimas **y recursos**".

## P2 · Nodo "Mecanismo de daño" → sumar orígenes, enfermedad súbita y ambiente
- **Qué:** el PDF dice que las lesiones pueden deberse a **traumatismo, ambiente, enfermedad súbita o combinación** — el contenido solo cubría la parte de trauma (fuerza/tiempo/área). Sumar: los **orígenes** posibles, cómo abordar una **enfermedad súbita** (buscar pistas en la dolencia principal; preguntar a víctima y testigos) y el **ambiente** (clima como causa/agravante).
- **Datos (ya en el YAML v0.6):** `mecanismo_dano` ahora tiene `origenes`, `enfermedad_subita` y `ambiente`.
- **Dónde:** `chainModel.ts` → SCENE_TOPICS `scene-mechanism.fields`: agregar `['origenes','Orígenes posibles']`, `['enfermedad_subita','Si es enfermedad súbita']`, `['ambiente','Ambiente']`. Reetiquetar `['evaluar', ...]` a **"Qué evaluar (en trauma)"** para dejar claro que aplica al traumatismo.

## Nota
Mismo patrón que P1: el contenido era correcto pero compactado; estos nodos ahora reflejan el PDF completo. En una próxima pasada puedo revisar **bioseguridad** (falta la técnica de quitarse guantes) y **evacuación** (comunicación / posición / evaluación continua) con la misma lupa, si querés cerrar toda la escena/CAV de una.
