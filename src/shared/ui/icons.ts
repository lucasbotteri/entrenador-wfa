import {
  AlertTriangle, Droplet, Wind, Activity, HeartPulse, Brain, Thermometer,
  Gauge, Eye, ClipboardList, Search, Circle, Siren, PhoneCall, type LucideIcon,
} from 'lucide-react'

export type ConceptIcon =
  | 'scene' | 'hemorrhage' | 'airway' | 'breathing' | 'circulation' | 'deficit'
  | 'exposure' | 'vitalSigns' | 'consciousness' | 'history' | 'physicalExam'
  | 'pupils' | 'evacuation' | 'help'

export const ICONS: Record<ConceptIcon, LucideIcon> = {
  scene: AlertTriangle, hemorrhage: Droplet, airway: Wind, breathing: Activity,
  circulation: HeartPulse, deficit: Brain, exposure: Thermometer, vitalSigns: Gauge,
  consciousness: Eye, history: ClipboardList, physicalExam: Search, pupils: Circle,
  evacuation: Siren, help: PhoneCall,
}
