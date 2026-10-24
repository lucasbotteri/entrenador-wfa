# Validación — CAV completa contra el manual (v0.8)

> Relectura **completa** del PDF (184 páginas; Cap. 1-15 + anexo SOAP) para que el módulo Aprender tenga todo lo necesario para aplicar la Cadena de Atención de Víctimas. Resultado en `contenido-cav.yaml` v0.8 y `casos.yaml`. Las páginas citadas son las del manual impreso.

## Correcciones de contenido (estaba mal o sin respaldo)
- **"Nada por boca ante shock / lesión abdominal" — no está en el manual.** El manual solo prohíbe comer/beber **tras un desmayo, hasta que se recupere y pueda tragar** (p. 128). Ante **hemorragia interna / shock** dice lo contrario: *"manténgala abrigada, hidratada y en una posición cómoda, trate el shock y evacúe"* (p. 67). → Regla `no-comer-beber` reemplazada por `nada-por-boca` (conciencia alterada) + `hemorragia-interna` (abrigada, hidratada si traga, posición cómoda, evacuar CRÍTICO). Tarjeta `t-no-comer` reformulada (desmayo). Caso 1: el distractor "darle agua" ahora se explica por **no responder** (no puede tragar), y el distractor "darle de comer/beber" de la secundaria se reemplazó por "dejarlo destapado" (perdió sangre → se enfría, p. 33 y p. 67).
- **PLS pertenece a la B, no a la A.** *"Si la víctima NO responde y respira normalmente, colóquela en PLS"* está bajo **Buena ventilación** (p. 32). → Regla `pls` movida a la letra B, con la variante con sospecha de columna (boca arriba, cabeza inmovilizada).
- **"Afterdrop"** (caso 2) no es un término del manual → "shock térmico" (p. 149).
- **"Reconocer taquicardia/taquipnea como shock"** (caso 1) no está en el manual → "línea de base con hora; inestable → reevaluar cada 5 min".

## Contenido nuevo (faltaba para aplicar el framework)
- **Organizador previo** (`intro`): qué es la CAV, 4 eslabones, objetivo (oxigenación/perfusión, tríada vital), flexibilidad del orden, decisión grave/no grave, lugar remoto, factor tiempo (p. 4-8, 22).
- **Preguntas guía por eslabón** (`cadena[].preguntas`, p. 22-23).
- **Escena:** preguntas al llegar (p. 23); sin guantes → barrera improvisada; lavado de manos completo y vacunas (p. 24, 9, 77); MDD: preguntas ante una caída en escalada, física del trauma (Cap. 4) y la lista para **sospechar lesión de columna** (p. 92); **buscar ayuda** estructurado: calma, grupo de rescate, datos que pide el SEM, números (Argentina 107…), ayuda externa/radio y señalización (p. 28-29, 4).
- **Primaria:** pasos de presentación a la víctima consciente (7 puntos, p. 29); **procedimiento por letra** (`pasos`): H (presión → torniquete 5-8 cm, solo extremidades, nunca articulación, anotar hora, segundo torniquete, tronco/cuello con apósito hemostático, dónde NO presionar; Cap. 5); A (¿responde?, orientación tiempo/espacio/persona/qué pasó, frente-mentón vs. subluxación con técnica); B (PLS + pasos de la posición de recuperación, p. 34); C (ropa abultada, signos de shock completos, hemorragia interna); D (inmovilización total; lesión de cabeza con conciencia alterada = columna); E (en el suelo se enfría, trauma → abrigar a todos, a veces enfriar). Nota de flexibilidad (p. 22).
- **Secundaria:** nodo "Cómo encararla" (qué evaluar, línea de base, por dónde empezar, **seguir en el terreno o evacuar**, **inestable si…**, reevaluación 15-20/5 min, datos de la víctima, distracciones; p. 35-36, 41-42). Signos vitales: técnica y calidad de FR, **ruidos respiratorios**, técnica y sitios del pulso, PA por **palpación**, significado, temperatura de referencia, interpretación de la piel, relleno capilar en extremidades frías (p. 36-40). AVDN: A−, D no cambia la evacuación y cómo comprobarlo (p. 40-41, 128). PILAR: técnica y anomalías (p. 41). MUESTRA: preguntas por letra (p. 42-43). DIAS: revisión rápida vs. detallada y **examen por región** (cabeza, cuello, tórax, abdomen, pelvis, extremidades, espalda; p. 44-47). **MSC** con técnica (p. 108).
- **Evacuación:** conducta por nivel (anexo p. 165); posición al vomitar (en bloque) e hipotermia grave; **SOAP** con la estructura de la ficha, problema → problema derivado, tratamiento real y preguntas de la evaluación continua (p. 47-48, 162-165).
- **Criterios de evacuación por cuadro** (`criterios_evacuacion`, 31 filas): hemorragias, heridas, quemaduras, columna/cabeza, huesos/articulaciones, desmayo, hiponatremia, cardíaco/ACV, mordeduras, calor, hipotermia, altitud (Cap. 5-15). Es el 4.º eslabón aplicado.
- **Temas clínicos** con detalle: hipotermia por nivel, shock, empaque (4 capas), **lesión de columna** (inmovilización manual, cuándo no alinear). Sigla **CAFE** (lesiones cerradas, p. 68-69).
- **Tarjetas nuevas:** 107, datos para el SEM, paro → RCP, orientación, torniquete nunca sobre articulación, D no cambia la evacuación, inestable si, GRAVE significa.
- **Caso resuelto** completo: ahora pasa por las 6 letras y la secundaria.

## Confirmado sin cambios
HABCDE y su orden; frente-mentón vs. subluxación; AVDN, DIAS, PILAR, MSC, SOAP; FR/FC por edad, PA, relleno < 2 s; hemorragia → torniquete 5-8 cm; shock = pálida, fría y húmeda; CRÍTICO/GRAVE/LEVE; TEV (tríada/triángulo) y MUESTRA·E (eventos/episodios) ya documentados.

## Discrepancias internas del manual (documentadas, no inventadas)
- Caída que hace sospechar lesiones graves: Cap. 3 "2 a 3 veces la altura" (p. 26) vs. Cap. 4 "2,5 a 3 veces" (p. 54). Se usa 2-3.
- Hipotermia "leve": el manual la define con temperatura central normal o levemente baja (> 35 °C) aunque hipotermia = < 35 °C (p. 147-148). Se transcribe tal cual.

## Alcance
Núcleo CAV completo + criterios de evacuación por cuadro. Los protocolos detallados de cada capítulo (vendajes, inmovilizaciones, quemaduras, altitud…) siguen fuera de Aprender; quedan como referencia en los criterios y en `Backlog de Escenarios.md`.
