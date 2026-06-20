/* eslint-disable @typescript-eslint/no-explicit-any */
// Explicit, documented es→en key mapping (spec §4.3). User-facing strings are
// NOT translated — only keys are anglicized.

const PHASE_MAP: Record<string, string> = {
  escena: 'scene',
  primaria: 'primary',
  secundaria: 'secondary',
  evacuacion: 'evacuation',
}

export function mapAcronym(a: any) {
  return {
    id: a.id,
    acronym: a.sigla,
    name: a.nombre,
    concept: a.concepto,
    isSequence: a.es_secuencia,
    rationale: a.racional,
    ...(a.definicion ? { definition: a.definicion } : {}),
    ...(a.nota ? { note: a.nota } : {}),
    ...(a.letras
      ? {
          letters: a.letras.map((l: any) => ({
            letter: l.letra,
            meaning: l.significado,
            detail: l.detalle,
          })),
        }
      : {}),
    ...(a.componentes
      ? { components: a.componentes.map((c: any) => ({ name: c.nombre, detail: c.detalle })) }
      : {}),
  }
}

export function mapChainPhase(p: any) {
  const phase = PHASE_MAP[p.fase]
  if (!phase) throw new Error(`Unknown phase: ${p.fase}`)
  return {
    phase,
    name: p.nombre,
    rationale: p.racional,
    ...(p.orden_estricto ? { strictOrder: true } : {}),
    ...(p.ref_sigla ? { refAcronym: p.ref_sigla } : {}),
    ...(p.secuencia
      ? {
          sequence: p.secuencia.map((s: any) => ({
            order: s.orden,
            part: s.parte,
            ...(s.prioridad ? { priority: true } : {}),
            ...(s.incluye ? { includes: s.incluye } : {}),
          })),
        }
      : {}),
    ...(p.luego ? { next: p.luego } : {}),
    content: p.contenido ?? {},
  }
}

export function mapEvacLevel(e: any) {
  return { level: e.nivel, color: e.color, criterion: e.criterio }
}

export function mapPracticalRule(r: any) {
  return {
    id: r.id,
    rule: r.regla,
    concept: r.concepto,
    ...(r.letra ? { letter: r.letra } : {}),
  }
}

export function mapClinicalTopic(t: any) {
  return { id: t.id, name: t.nombre, rationale: t.racional }
}

export function mapCard(c: any) {
  return {
    id: c.id,
    topic: c.tema,
    type: c.tipo,
    prompt: c.prompt,
    answer: c.respuesta,
    ...(c.opciones ? { options: c.opciones } : {}),
    rationaleRef: c.racional_ref,
  }
}

export function mapPosition(p: any) {
  return { situation: p.situacion, position: p.posicion }
}

// Cases are a Module 3 contract (validated, unused in v1). Only the structural
// keys the CaseSchema reads are anglicized (titulo → title); the rich Spanish
// scenario body passes through untouched.
export function mapCase(c: any) {
  const { titulo, ...rest } = c
  return { ...rest, title: titulo }
}

export function mapWorkedExample(w: any) {
  return {
    title: w.titulo,
    steps: w.steps.map((s: any) => ({
      phase: PHASE_MAP[s.fase] ?? s.fase,
      state: s.estado,
      action: s.accion,
      rationaleRef: s.racional_ref,
    })),
  }
}
