import {
  AlertTriangle, Droplet, Wind, Activity, HeartPulse, Brain, Thermometer,
  Gauge, Eye, ClipboardList, Search, Circle, Siren, PhoneCall,
  ShieldAlert, Zap, Users, ScanEye, Hand, FileText, HeartHandshake,
  ListChecks, BookOpen, ClipboardCheck, type LucideIcon,
} from 'lucide-react'

export type ConceptIcon =
  | 'scene' | 'hemorrhage' | 'airway' | 'breathing' | 'circulation' | 'deficit'
  | 'exposure' | 'vitalSigns' | 'consciousness' | 'history' | 'physicalExam'
  | 'pupils' | 'evacuation' | 'help'
  | 'safety' | 'mechanism' | 'victims' | 'impression' | 'extremities'
  | 'record' | 'care' | 'approach' | 'intro' | 'before' | 'rules'

export const ICONS: Record<ConceptIcon, LucideIcon> = {
  scene: AlertTriangle, hemorrhage: Droplet, airway: Wind, breathing: Activity,
  circulation: HeartPulse, deficit: Brain, exposure: Thermometer, vitalSigns: Gauge,
  consciousness: Eye, history: ClipboardList, physicalExam: Search, pupils: Circle,
  evacuation: Siren, help: PhoneCall,
  safety: ShieldAlert, mechanism: Zap, victims: Users, impression: ScanEye,
  extremities: Hand, record: FileText, care: HeartHandshake, approach: ListChecks,
  intro: BookOpen, before: ClipboardCheck, rules: ClipboardList,
}
