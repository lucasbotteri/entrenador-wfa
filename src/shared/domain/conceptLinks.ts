// concept id (from cards / case actions) → a representative Module-1 route.
const CONCEPT_TO_NODE: Record<string, string> = {
  habcde: '/chain/primary-habcde-h',
  primaria: '/chain/primary-before',
  avdn: '/chain/secondary-avdn',
  muestra: '/chain/secondary-muestra',
  dias: '/chain/secondary-dias',
  msc: '/chain/secondary-msc',
  pilar: '/chain/secondary-pilar',
  shock: '/chain/primary-habcde-c',
  signos_vitales: '/chain/secondary-vital-signs',
  secundaria: '/chain/secondary-approach',
  tev: '/chain/scene-impression',
  escena: '/chain/scene-safety',
  mdd: '/chain/scene-mechanism',
  columna: '/chain/primary-habcde-d',
  soap: '/chain/evacuation-soap',
  termica: '/quickref#temas',
  empaque: '/quickref#temas',
  cafe: '/quickref#siglas',
  evacuacion: '/chain/evacuation-decision',
  niveles_evacuacion: '/chain/evacuation-decision',
}

export function linkForRef(ref: string): string {
  return CONCEPT_TO_NODE[ref] ?? '/'
}
