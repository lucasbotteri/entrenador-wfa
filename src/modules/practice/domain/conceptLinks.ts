// Map a card rationaleRef to a representative Module-1 node route (ids per chainModel).
const CONCEPT_TO_NODE: Record<string, string> = {
  habcde: '/chain/primary-habcde-h',
  avdn: '/chain/secondary-avdn',
  muestra: '/chain/secondary-muestra',
  dias: '/chain/secondary-dias',
  pilar: '/chain/secondary-pilar',
  shock: '/chain/secondary-vital-signs',
  signos_vitales: '/chain/secondary-vital-signs',
  secundaria: '/chain/secondary-vital-signs',
  tev: '/chain/scene-impression',
  escena: '/chain/scene-safety',
  primaria: '/chain/primary-habcde-h',
  mdd: '/chain/scene-mechanism',
  msc: '/chain/scene-mechanism',
  soap: '/quickref',
  niveles_evacuacion: '/chain/evacuation-decision',
}

export function linkForRef(ref: string): string {
  return CONCEPT_TO_NODE[ref] ?? '/'
}
