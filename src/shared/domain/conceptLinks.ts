// concept id (from cards / case actions) → a representative Module-1 route.
const CONCEPT_TO_NODE: Record<string, string> = {
  habcde: '/chain/primary-habcde-h',
  primaria: '/chain/primary-habcde-h',
  avdn: '/chain/secondary-avdn',
  muestra: '/chain/secondary-muestra',
  dias: '/chain/secondary-dias',
  pilar: '/chain/secondary-pilar',
  shock: '/chain/secondary-vital-signs',
  signos_vitales: '/chain/secondary-vital-signs',
  secundaria: '/chain/secondary-vital-signs',
  tev: '/chain/scene-impression',
  escena: '/chain/scene-safety',
  mdd: '/chain/scene-mechanism',
  msc: '/chain/scene-mechanism',
  soap: '/quickref',
  evacuacion: '/chain/evacuation-decision',
  niveles_evacuacion: '/chain/evacuation-decision',
}

export function linkForRef(ref: string): string {
  return CONCEPT_TO_NODE[ref] ?? '/'
}
