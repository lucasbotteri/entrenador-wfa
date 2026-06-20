/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse as parseYaml } from 'yaml'

import {
  mapAcronym,
  mapChainPhase,
  mapEvacLevel,
  mapPracticalRule,
  mapClinicalTopic,
  mapCard,
  mapCase,
  mapPosition,
  mapWorkedExample,
} from '../src/shared/content/mapping'
import { ContentSchema, CasesSchema } from '../src/shared/content/schemas'

import {
  findDuplicateIds,
  findDanglingRefs,
  findElegirWithoutOptions,
  findCaseConceptDangling,
} from './integrity'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')

function readYaml(rel: string): any {
  return parseYaml(readFileSync(resolve(root, rel), 'utf8'))
}

function mapContent(raw: any) {
  return {
    meta: {
      source: raw.meta?.fuente ?? '',
      version: raw.meta?.version ?? '',
      language: raw.meta?.idioma ?? 'es',
    },
    acronyms: (raw.siglas ?? []).map(mapAcronym),
    chain: (raw.cadena ?? []).map(mapChainPhase),
    vitalSigns: anglicizeVitals(raw.signos_vitales ?? {}),
    positions: (raw.posicion_victima ?? []).map(mapPosition),
    practicalRules: (raw.reglas_practicas ?? []).map(mapPracticalRule),
    evacLevels: (raw.niveles_evacuacion ?? []).map(mapEvacLevel),
    clinicalTopics: (raw.temas_clinicos ?? []).map(mapClinicalTopic),
    cards: (raw.tarjetas ?? []).map(mapCard),
    workedExample: mapWorkedExample(raw.worked_example ?? {}),
  }
}

// vitalSigns keys are preserved loosely (schema uses passthrough); we only
// rename the top-level ones the UI reads.
function anglicizeVitals(v: any) {
  return {
    components: v.componentes,
    respiratoryRate: v.frecuencia_respiratoria,
    heartRate: v.frecuencia_cardiaca,
    bloodPressure: v.presion_arterial,
    skin: v.piel,
    capillaryRefill: v.relleno_capilar,
    reevaluacion: v.reevaluacion,
  }
}

function fail(msg: string): never {
  console.error(`\n✖ content build failed:\n${msg}\n`)
  process.exit(1)
}

function main() {
  const rawContent = readYaml('docs/contenido-cav.yaml')
  const rawCases = readYaml('docs/casos.yaml')

  const mapped = mapContent(rawContent)

  const contentResult = ContentSchema.safeParse(mapped)
  if (!contentResult.success) {
    fail(contentResult.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n'))
  }
  const content = contentResult.data

  const casesResult = CasesSchema.safeParse((rawCases.casos ?? []).map(mapCase))
  if (!casesResult.success) {
    fail(casesResult.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n'))
  }

  // Integrity checks (Task 11) are invoked here.
  runIntegrityChecks(content)

  const caseDangling = findCaseConceptDangling(content, casesResult.data)
  if (caseDangling.length) fail(caseDangling.map(c => `  Dangling case concept: ${c}`).join('\n'))

  if (!checkOnly) {
    const outDir = resolve(root, 'src/shared/content/generated')
    mkdirSync(outDir, { recursive: true })
    writeFileSync(resolve(outDir, 'content.json'), JSON.stringify(content, null, 2))
    writeFileSync(resolve(outDir, 'cases.json'), JSON.stringify(casesResult.data, null, 2))
    console.log('✓ content built')
  } else {
    console.log('✓ content valid')
  }
}

function runIntegrityChecks(content: any) {
  const dups = findDuplicateIds(content)
  if (dups.length) fail(dups.map(id => `  Duplicate concept id: ${id}`).join('\n'))
  const dangling = findDanglingRefs(content)
  if (dangling.length) fail(dangling.map(r => `  Dangling rationaleRef: ${r}`).join('\n'))
  const noOpts = findElegirWithoutOptions(content)
  if (noOpts.length) fail(noOpts.map(id => `  elegir card without options: ${id}`).join('\n'))
}

main()
