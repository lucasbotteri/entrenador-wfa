# Motor de Escenarios — Diseño (borrador para discutir)

> Objetivo: escenarios que te pongan "en el lugar", que evalúen **toda la Cadena de Atención a la Víctima** en un solo caso realista, y donde la respuesta **no sea obvia**. Sin LLM. Basado en pedagogía (efecto de generación, *key features*, debrief de simulación).

---

## 1. La idea central: **un caso, tres formas de practicar**

No son tres motores: es **un mismo caso** visto con tres lentes. Esto baja muchísimo el costo de autoría (escribís el caso una vez) y te da variedad pedagógica.

De cada caso definimos, por fase:

- **Acciones clave** (lo correcto y crítico = los *key features*)
- **Distractores** — el corazón del asunto: acciones que un socorrista **competente-pero-imperfecto podría llegar a elegir** de verdad. No "errores de chiste" (ver **Principio: el buen distractor**, abajo).
- **Racional** (el "por qué", que se reusa del módulo de Aprender)

A partir de eso salen los tres modos:

| Modo | Qué ve el jugador | Cómo evita lo "obvio" |
|---|---|---|
| **B · Banco de acciones** | Un banco grande (~25) con clave + distractores mezclados (correctas-en-otro-contexto, misconcepciones, variantes); elige **qué** y en **qué orden** | Muchas opciones plausibles mezcladas → la pista no ayuda; el orden hay que generarlo |
| **A · Recordar primero** | Solo la escena; vos decidís/escribís **sin lista**; recién después se revela y te autocalificás | Generación pura, cero pistas |
| **C · Detectar el error** | Un socorrista (ficticio) que actúa con un error plantado (omisión, exceso o mal orden); lo marcás | No hay opción correcta "servida"; entrena vigilancia |

---

## ⭐ Principio: el buen distractor (lo que hace que NO sea obvio)

**Regla de oro:** un distractor sirve solo si un socorrista competente-pero-imperfecto **podría elegirlo de verdad**. Si nadie que esté pensando lo elegiría ("correr cuesta abajo sin mirar", "sacarle el casco de una"), fuera — no discrimina nada.

Los buenos distractores no son "lo absurdo": son **discriminaciones que importan**. Cinco tipos, cada uno enseña algo distinto:

| Tipo | Qué es | Ejemplo (bueno) |
|---|---|---|
| **Prioridad/orden** | Acción correcta, momento equivocado | Tomar la anamnesis (MUESTRA) antes de frenar la hemorragia masiva |
| **Contexto** | Correcta en OTRO escenario, no indicada por las señales de éste | Poner en PLS… cuando hay sospecha de columna |
| **Misconcepción** | Intuitiva pero desaconsejada | Dar agua al que "se ve decaído"; ir directo al torniquete sin probar presión directa |
| **Técnica/variante** | Acción correcta, variante equivocada | Frente-mentón en vez de subluxación mandibular con trauma |
| **Ineficiencia** | No peligrosa, solo innecesaria (penaliza poco) | Medir temperatura con termómetro exacto en plena primaria |

La idea, en una línea:
- ❌ *Antes:* "Sacarle el casco de inmediato" → obvio, no enseña.
- ✅ *Después:* "Ir directo a asistir a tu compañero" (el impulso natural) en vez de asegurar la escena → **todos sienten esa tentación**; ahí está el aprendizaje.

El truco para que el banco no sea adivinable **no es agregar opciones tontas**, sino llenarlo de **acciones correctas-en-otro-contexto** y de **misconcepciones reales**.

---

## 2. Anatomía de un caso

Un caso se despliega en **4 fases** que son la propia Cadena de Atención:

1. **Escena** — seguridad, bioseguridad, mecanismo de daño, nº de víctimas, impresión general (TEV), buscar ayuda
2. **Evaluación primaria (HABCDE)** — el orden importa
3. **Evaluación secundaria** — signos vitales, AVDN, MUESTRA, DIAS, PILAR, reevaluar
4. **Decisión de evacuación** — CRÍTICO / GRAVE / LEVE

Cada fase tiene:
- `estado`: lo que percibís ahora (narrativa + signos revelados)
- `acciones_clave`, `trampas`, `ruido` (con su racional)
- `revelaciones`: cómo cambia el estado según lo que hacés (**divulgación progresiva** → no ves todo de una, y la info nueva puede cambiar la acción correcta)
- `transición`: condición para avanzar de fase

---

## 3. Scoring y *debrief* (lo que de verdad importa)

No puntuamos "cuántos clicks acertaste", sino **las decisiones que importan** (key-feature scoring). La salida principal **no es un número**, es un **debrief** como el de una simulación real (que es donde más se aprende):

- ✅ **Hiciste** las acciones críticas (y respetaste prioridades)
- ⚠️ **Te faltó** (omisiones de acciones clave)
- ❌ **Hiciste de más / peligroso** (activaste una trampa)
- 🧭 **Calibración de prioridades**: ¿respetaste el orden vital? (ej.: hemorragia masiva *antes* que vía aérea)
- Cada ítem enlaza al fragmento del módulo **Aprender** (feedback elaborativo, también en los aciertos)

Reglas de puntuación:
- Acción clave **crítica** hecha → crédito; omitida → *fallo crítico*
- **Orden estricto** en HABCDE: el orden completo H→A→B→C→D→E cuenta; invertir pasos penaliza, y saltear "H" con hemorragia masiva es fallo crítico
- **Trampa** activada → penalización + feedback inmediato (momento de enseñanza)
- **Ruido** → costo mínimo o nulo (es ineficiente, no peligroso → no lo castigamos de más)

Para gamificar, además mostramos un resumen seco: *"decisiones críticas 4/5 · errores peligrosos 1 · prioridades respetadas ✓"*.

---

## 4. Garantías de que **no es obvio** (y anti-trampa)

- Banco **grande y mezclado** (la evidencia: más alternativas = más difícil y menos adivinable)
- El **orden se genera**, no se reconoce
- Las trampas son **plausibles acá** (dar agua a alguien en shock; frente-mentón con trauma) → no son distractores tontos
- **Divulgación progresiva**: info nueva puede cambiar la acción correcta (sabor *script concordance*)
- Sin reintentos infinitos dentro de una corrida puntuada (podés re-jugar el caso de cero)
- Tiempo **solo** en la fase primaria (automatismo); en las fases de razonamiento, sin reloj (el estrés de más perjudica el aprendizaje)

---

## 5. Esquema de datos (para autoría futura)

```yaml
caso:
  id: descenso-bloques
  titulo: "Caída en un descenso, terreno de bloques"
  contexto: "..."
  fases:
    - id: escena
      estado: "..."
      acciones_clave:
        - {id: seguridad, texto: "...", critico: true, concepto: "Escena/Seguridad", racional: "..."}
      trampas:
        - {id: correr, texto: "...", gravedad: peligrosa, por_que_no: "...", concepto: "Escena"}
      ruido:
        - {id: presion-ahora, texto: "...", por_que_no: "Es secundaria, no toca aún"}
      revelaciones:
        - {si_hace: acercarse_seguro, revela: "Respira pero no responde; sangrado pulsátil"}
      transicion: "completar acciones_clave críticas"
```

Una sola estructura alimenta los 3 modos. Autoría = escribir buenos casos; el motor se reutiliza.

---

## 6. CASO DE EJEMPLO COMPLETO — *"Caída en un descenso, terreno de bloques"*

**Contexto.** Descenso de una cumbre por un canal de pedrero, en zona remota, ~2 h de la zona de aproximación. Tu compañero pisa un bloque suelto, resbala y cae varios metros golpeando contra las rocas. Lo ves tendido, con un corte importante en el muslo que **sangra abundante y pulsátil**, y **no se mueve**.

### Fase 0 · Escena
**Estado:** canal de pedrero con bloques inestables y riesgo de caída de piedras, sangrado visible, dos compañeros cerca y el resto de la cordada por encima.

| Acción | Tipo | Por qué |
|---|---|---|
| Mirar el terreno y asegurar la zona (bloques inestables, caída de piedras) | **Clave (crítico)** | No convertirte en segunda víctima |
| Ponerte guantes (bioseguridad) | **Clave (crítico)** | EPP antes de tocar sangre |
| Identificar el mecanismo: caída contra rocas → sospechar trauma de columna | **Clave** | Decide la maniobra de vía aérea después |
| Impresión general / TEV (¿respira?, ¿responde?, color) sin tocar | **Clave** | Idea de gravedad antes del HABCDE |
| Designar a alguien para llamar a emergencias | **Clave** | Activar evacuación temprano |
| **Ir directo a asistir** a tu compañero (sin asegurar la zona) | Distractor · misconcepción | El impulso natural; pero podés volverte 2ª víctima. **La** discriminación real de esta fase |
| Tomar signos vitales / anamnesis apenas llegás | Distractor · prioridad | Eso es secundaria; primero escena y primaria |
| Llamar a emergencias vos mismo y quedarte al teléfono | Distractor · prioridad | Mejor delegar la llamada y seguir atendiendo |
| Ponerlo en posición lateral de seguridad (PLS) | Distractor · contexto | PLS sería correcta… si NO hubiera sospecha de trauma; acá sí la hay |

**Revelación:** al acercarte con seguridad → *respira, pero no responde a tu voz; el sangrado del muslo es a chorro.*

### Fase 1 · Primaria (HABCDE) — *el orden importa*
**Estado:** no responde, respira; sangrado pulsátil en muslo; casco puesto; cayó contra rocas.

| Orden | Acción clave | Por qué |
|---|---|---|
| 1 | **H** — Control de hemorragia masiva: presión directa; si no cede en los primeros minutos, torniquete a 5–8 cm de la herida (nunca sobre articulación), anotar la hora | Lo primero que mata, primero |
| 2 | **A** — Abrir vía aérea **con control cervical** (subluxación mandibular) | Hay mecanismo de trauma |
| 3 | **B** — ¿Respira normal? esfuerzo, frecuencia | Ventilación |
| 4 | **C** — Buscar sangrados ocultos + signos de shock (piel pálida, fría, húmeda) | Circulación |
| 5 | **D** — Conciencia (AVDN) + inmovilizar columna | Déficit neurológico |
| 6 | **E** — Exponer lesiones ocultas + abrigar | Temperatura/exploración |

**Distractores (por tipo):**
- *Técnica/variante:* hacer **frente-mentón** en vez de subluxación mandibular (hay sospecha de columna).
- *Prioridad/orden:* empezar por A o B **antes** de frenar el sangrado masivo.
- *Misconcepción:* ir **directo al torniquete** sin probar presión directa (el manual: torniquete recién si la presión directa no cede en los primeros minutos).
- *Misconcepción:* dar agua "porque está pálido".
- *Contexto:* **sentarlo** para que "respire mejor" (correcto en disnea sin trauma; acá no).
- *Ineficiencia:* cronometrar la FC exacta ahora (el dato fino es de la secundaria).
**Revelación (al hacer E):** *hematoma en abdomen + piel fría y húmeda* → sospecha de shock por sangrado interno.
**Foco de scoring:** ¿H antes que todo? ¿A con control cervical y **no** frente-mentón? ¿reconoció el shock?

### Fase 2 · Secundaria
**Estado:** hemorragia del muslo controlada; consciente pero alterado; pálido, frío, húmedo; dolor abdominal; hematoma.

| Acción clave | Por qué |
|---|---|
| Signos vitales: FR y FC, y reconocer taquicardia/taquipnea como shock (normal adulto: FC 60–100, FR 12–20) | Confirma gravedad |
| AVDN: catalogar nivel de conciencia | Tendencia neurológica |
| MUESTRA (anamnesis): medicación, alergias, qué pasó… | Contexto clínico |
| DIAS (examen físico de cabeza a pies) | Buscar lo que falta |
| **Reevaluar** (no quedarse con la primera toma) | El cuadro evoluciona |

**Distractores (por tipo):**
- *Misconcepción:* dar de comer/beber (hay sospecha de lesión abdominal).
- *Prioridad:* demorarte en una secundaria exhaustiva cuando el cuadro ya pide evacuación (sobre-evaluar).
- *Contexto:* enfocarte en PILAR/pupilas en detalle cuando lo que define la conducta es el shock.
- *Ineficiencia:* termómetro exacto (útil, no determinante acá).

### Fase 3 · Evacuación
**Estado:** shock con sospecha de sangrado interno, zona remota a 2 h.

- **Decisión correcta: CRÍTICO** — amenaza inmediata para la vida; evacuar lo antes posible; el sangrado interno no se resuelve en el terreno.
- Distractores: *GRAVE* (subestima el shock) · *LEVE* (peligroso).

### Debrief de ejemplo (lo que vería el jugador)
- ✅ Aseguraste la escena y frenaste la hemorragia **primero** (prioridad vital correcta).
- ✅ Abriste la vía aérea con control cervical.
- ⚠️ Tardaste en reconocer el shock (piel fría/húmeda en C).
- ❌ Ofreciste agua → con sospecha abdominal/shock, no. ➜ *ver "Circulación / shock" en Aprender.*
- 🧭 Prioridades H→A→B respetadas ✓
- 🏁 Decisión final: **CRÍTICO** ✓
- Conceptos tocados en este caso: **escena · HABCDE completo · shock · AVDN · MUESTRA/DIAS · evacuación.**

> Un solo caso ejercitó casi toda la cadena. Eso es lo que buscábamos: integración realista, no preguntas sueltas.

---

## 6.b SEGUNDO CASO — *Hipotermia: vivac forzado en tormenta*

**Por qué este caso:** el manejo de la hipotermia es **contraintuitivo** (de ahí los mejores distractores) y obliga a leer un cuadro que **empeora de forma insidiosa**. Toca poco trauma y mucho juicio: ambiente, AVDN, temperatura (la "E") y una evacuación que **cambia de nivel sobre la marcha**.

**Contexto.** Cumbre larga; en el descenso los agarra mal tiempo (viento y lluvia/nieve, todos mojados) y deben vivaquear. Una compañera habla cada vez menos, **tirita fuerte** y no coordina bien las manos para armar el refugio. Están a ~3–4 h del refugio, ya cayendo la tarde.

### Fase 0 · Escena
**Estado:** tormenta y viento, el grupo mojado, la luz cayendo; la compañera tiritando, lenta y torpe.

| Acción | Tipo | Por qué |
|---|---|---|
| Leer el entorno y las condiciones predisponentes (viento, humedad, agotamiento, sin abrigo seco) | **Clave** | La hipotermia es insidiosa: el contexto la anticipa |
| Resguardar al grupo / no arriesgar a todos | **Clave** | Seguridad del equipo primero |
| Armar refugio del viento y **aislarla del suelo** | **Clave (crítico)** | Frenar la pérdida de calor es *el* tratamiento |
| Impresión general (TEV): tirita, consciente pero lenta | **Clave** | Estima la gravedad sin tocar |
| No dejarla sola; asignar a alguien | **Clave** | "Nunca dejar sola a una víctima hipotérmica" |
| Darle un trago de alcohol "para entrar en calor" | Distractor · misconcepción | El alcohol **predispone** a la hipotermia (vasodilata) |
| Apurarla a caminar 3 h al refugio sin protegerla antes | Distractor · prioridad | Está descoordinada y empeorando; primero frenar el frío |
| Tomarle signos vitales con apuro | Distractor · prioridad | El manual: sin apuro; primero aislarla del frío |

**Revelación:** al resguardarla ves piel fría, pálida y azulada; está orientada pero lenta → compatible con hipotermia leve-moderada.

### Fase 1 · Primaria (foco en la "E")
**Estado:** consciente, responde pero lenta; tiritando fuerte; piel fría/azulada; ropa mojada.

| Acción clave | Por qué |
|---|---|
| Confirmar vía aérea/ventilación (habla → OK) | Descarta amenaza inmediata |
| AVDN: ¿sigue **A**lerta o ya responde solo a **V**erbal? | Marca el nivel de hipotermia |
| **E — quitar la ropa húmeda, capas secas, cubrir la cabeza, aislar del suelo, refugio** | Frenar la pérdida de calor; el corazón del caso |
| No cortar la ropa; aislarla rápido del suelo | Evita más pérdida de calor |

**Distractores (por tipo):**
- *Misconcepción (la estrella):* **friccionarle/frotarle brazos y piernas** para "activar la circulación" → lleva sangre fría del centro a la periferia → **shock térmico / PCR**.
- *Misconcepción:* meterla en agua caliente o apoyar una botella hirviendo **directa sobre la piel** / recalentarla rápido → quemaduras y *afterdrop*.
- *Misconcepción:* darle alcohol.
- *Contexto:* ponerla en PLS (está consciente; no corresponde).
- *Prioridad:* medir la temperatura exacta antes de aislarla del frío.

**Revelación:** con ropa seca y refugio **sigue tiritando** — y eso es **bueno**: los temblores generan calor. Sigue orientada → hipotermia leve-moderada.

### Fase 2 · Reconocer el nivel (y seguir la tendencia)
**Estado:** tiritando, orientada pero lenta.

| Acción clave | Por qué |
|---|---|
| Clasificar el nivel: >32 °C tiembla y AVDN alto; <32 °C deja de temblar y AVDN cae (V/D/N) | Define la conducta |
| Bebidas **tibias y dulces** + algo de comer | Combustible para generar calor |
| Que siga temblando dentro del saco; abrigar | Los temblores son calor "gratis" |
| **Reevaluar la tendencia** (¿mejora o empeora?) | La hipotermia evoluciona |

**Distractores (por tipo):**
- *Recognition trap (clave):* si más tarde **deja de tiritar y se la ve "más tranquila"**, leerlo como que **mejora** → es al revés: pasó a **grave**.
- *Misconcepción:* dejarla dormir sola "para que descanse" → nunca dejar sola; hay que vigilar.
- *Prioridad:* una anamnesis larguísima mientras sigue perdiendo calor.

**Revelación (giro):** pasa el rato y **deja de tiritar**, se pone apática y más torpe, cuesta despertarla → está **empeorando a grave**, no mejorando.

### Fase 3 · Manejo y evacuación (el nivel cambió)
**Estado:** sin temblores, apática, AVDN en V → hipotermia **grave** en curso.

| Acción clave | Por qué |
|---|---|
| Tratarla como grave: **empaque de hipotermia**, calor al **torso** (no directo a la piel), cabeza cubierta, posición horizontal | Frenar pérdida de calor; recalentamiento controlado |
| Moverla **muy suavemente** | Bajo 32 °C el corazón es hipersensible → riesgo de **fibrilación ventricular** |
| Evacuación **urgente**; no dejarla sola; no cambiar el plan aunque mejore | El tratamiento ideal es en el CAD |

- **Decisión:** el nivel pasó de **Leve a CRÍTICO** (grave) → evacuación urgente.
- Distractores: *"Leve, que se reponga en el refugio"* (subestima, peligroso) · *"Grave pero sin apuro"* (es urgente) · *recalentarla rápido* (shock térmico).

### Debrief de ejemplo
- ✅ Leíste el entorno y **frenaste la pérdida de calor** (ropa seca, aislar del suelo, refugio).
- ✅ No la frotaste, no le diste alcohol, no aplicaste calor directo ni rápido.
- ⭐ Reconociste que **dejar de tiritar = empeora** (pasó a grave), no que mejora.
- ✅ La moviste con suavidad (riesgo de FV) y subiste la evacuación a **CRÍTICO**.
- Conceptos tocados: **escena/entorno · AVDN · "E" del HABCDE · clasificación de hipotermia · empaque · evacuación dinámica.**

> Dos casos, dos lógicas: el de descenso entrena **prioridades vitales y orden** (HABCDE bajo trauma); el de hipotermia entrena **reconocimiento y manejo contraintuitivo** de un cuadro que evoluciona.

---

## 7. Cómo se conecta con las otras dos partes
- El **racional** de cada acción y el feedback salen del módulo **Aprender** (parte 1) → fuente de verdad única.
- Los conceptos que fallás en escenarios pueden **alimentar tu repaso espaciado** (parte 2): "te equivocaste con la vía aérea en trauma → más tarjetas de eso".

---

## 8. Decisiones tomadas
1. **Orden del HABCDE:** **estricto** — el orden completo H→A→B→C→D→E cuenta.
2. **Modo "recordar primero":** **autocalificación por honestidad** (simple; entrena metacognición, sin fricción).
3. **Primera versión:** **2 casos muy pulidos**, ambientados en **montañismo real** (aproximación, cumbre, descenso, vivac, altitud): el de trauma en descenso + el de **hipotermia** (vivac forzado en tormenta).
4. **Tono del debrief:** **exigente con la norma, respetuoso con la persona** (detalle abajo).

### Tono — lo que dice la pedagogía (y encaja con tu gusto por lo exigente)
El estándar en simulación clínica es *"Debriefing with Good Judgment"*: **altas exigencias + alta consideración** a la vez. Su "supuesto básico": *quien practica es capaz, le importa y quiere mejorar*. Traducido a nuestro debrief:
- **Directo, sin maquillar el error** (acá un error puede matar; la exigencia es parte del respeto).
- Estructura **transparente**: observación concreta → implicación clínica → el estándar correcto y su porqué.
- Nunca "sos malo"; siempre "esto estuvo por debajo del estándar; así se hace y por qué".
- Exigente en la **vara**, no en el desprecio. Eso es lo que más aprendizaje y motivación produce.
